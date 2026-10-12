import io
import json
import pandas as pd
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional,List,Literal

#Security
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
#Database

from sqlalchemy.orm import Session , defer

# ML Algorithm Executions
from app.ml.isolation_forest import execute_isolation_forest
from app.ml.lof import execute_lof
from app.ml.oc_svm import execute_oc_svm

# Groq AI Recommendation Service
from app.ml.dataset_helper import extract_dataset_summary
from app.ml.groq_service import get_anomaly_recommendation

# DB & Authentication Helpers
from app.database import engine, get_db
from app.database import Base
import app.models as models
from app.auth import hash_password, verify_password,create_access_token,decode_access_token

app = FastAPI(title="SentinelAI - Multi-Model Anomaly Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas for Authentication
class UserSignupSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


def load_dataframe(file_name: str, content: bytes) -> pd.DataFrame:
    file_ext = file_name.split(".")[-1].lower()

    if file_ext == "csv":
        return pd.read_csv(io.BytesIO(content))
    elif file_ext in ["xlsx", "xls"]:
        return pd.read_excel(io.BytesIO(content))
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a .csv or .xlsx file.",
        )

# ==========================================
# AUTH DEPENDENCY
# ==========================================

bearer_scheme = HTTPBearer()


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    user_id = decode_access_token(creds.credentials)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token. Please login again.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    return user


# ==========================================
# SAVED ANALYSES (UI -> DB -> UI)
# ==========================================

MODEL_LABELS = {
    "isolation_forest": "Isolation Forest",
    "lof": "Local Outlier Factor (LOF)",
    "oc_svm": "One-Class SVM",
}


class SaveAnalysisSchema(BaseModel):
    file_name: Optional[str] = None
    file_type: Literal["csv", "xlsx"] = "csv"
    model_name: str
    contamination: Optional[float] = None
    records: List[dict]


@app.post("/api/saves")
def save_analysis(
    payload: SaveAnalysisSchema,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not payload.records:
        raise HTTPException(status_code=400, detail="No records to save.")

    # Table -> CSV / Excel
    df = pd.DataFrame(payload.records)
    buffer = io.BytesIO()
    if payload.file_type == "xlsx":
        df.to_excel(buffer, index=False, engine="openpyxl")
    else:
        df.to_csv(buffer, index=False)

    anomalies = 0
    if "is_anomaly" in df.columns:
        anomalies = int((pd.to_numeric(df["is_anomaly"], errors="coerce") == 1).sum())

    stem = (payload.file_name or "analysis").rsplit(".", 1)[0]

    row = models.SavedAnalysis(
        user_id=current_user.id,
        file_name=f"{stem}_anomalies.{payload.file_type}",
        file_type=payload.file_type,
        file_data=buffer.getvalue(),
        model_name=payload.model_name,
        contamination=payload.contamination,
        total_records=len(df),
        anomalies_found=anomalies,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return {"status": "success", "id": row.id, "file_name": row.file_name}


@app.get("/api/saves")
def list_saves(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.SavedAnalysis)
        .options(defer(models.SavedAnalysis.file_data))  # list mein file load nahi hoti
        .filter(models.SavedAnalysis.user_id == current_user.id)
        .order_by(models.SavedAnalysis.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "file_name": r.file_name,
            "model_name": r.model_name,
            "total_records": r.total_records,
            "anomalies_found": r.anomalies_found,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@app.get("/api/saves/{save_id}")
def get_save(
    save_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    row = (
        db.query(models.SavedAnalysis)
        .filter(
            models.SavedAnalysis.id == save_id,
            models.SavedAnalysis.user_id == current_user.id,  # sirf apni file
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Saved analysis not found.")

    # CSV / Excel -> Table
    content = io.BytesIO(bytes(row.file_data))
    df = pd.read_excel(content) if row.file_type == "xlsx" else pd.read_csv(content)
    records = json.loads(df.to_json(orient="records"))  # NaN -> null

    total = row.total_records or len(records)
    anomalies = row.anomalies_found or 0

    return {
        "id": row.id,
        "file_name": row.file_name,
        "records": records,
        "summary": {
            "algorithm": MODEL_LABELS.get(row.model_name, row.model_name),
            "total_records": total,
            "anomalies_found": anomalies,
            "anomaly_rate": (anomalies / total) if total else 0,
            "processing_time_seconds": 0,
        },
    }


@app.delete("/api/saves/{save_id}")
def delete_save(
    save_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    row = (
        db.query(models.SavedAnalysis)
        .filter(
            models.SavedAnalysis.id == save_id,
            models.SavedAnalysis.user_id == current_user.id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Saved analysis not found.")
    db.delete(row)
    db.commit()
    return {"status": "deleted"}

@app.get("/")
def read_root():
    return {"message": "SentinelAI Anomaly Detection Engine is Active"}


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/api/auth/signup")
def signup(user_data: UserSignupSchema, db: Session = Depends(get_db)):
    # Existing user validation
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Account with this email already exists. Please login."
        )

    hashed_pwd = hash_password(user_data.password)
    new_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user_payload = {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email
    }

    return {
        "status": "success",
        "access_token": create_access_token(new_user.id),
        "user": user_payload
    }


@app.post("/api/auth/login")
def login(credentials: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email address or password."
        )

    user_payload = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email
    }

    return {
        "status": "success",
        "access_token": create_access_token(user.id),
        "user": user_payload
    }


# ==========================================
# MACHINE LEARNING ANOMALY DETECTION ENDPOINTS
# ==========================================

@app.post("/api/detect-anomalies")
async def detect_anomalies(
    file: UploadFile = File(...),
    algorithm: str = Form("isolation_forest"),
    contamination: float = Form(0.05),
    n_estimators: int = Form(100),
    n_neighbors: int = Form(20),
    kernel: str = Form("rbf")
):
    try:
        content = await file.read()
        df = load_dataframe(file.filename, content)

        if algorithm == "lof":
            results = execute_lof(
                df=df,
                contamination=contamination,
                n_neighbors=n_neighbors
            )
        elif algorithm == "oc_svm":
            results = execute_oc_svm(
                df=df,
                contamination=contamination,
                kernel=kernel
            )
        else:
            results = execute_isolation_forest(
                df=df,
                contamination=contamination,
                n_estimators=n_estimators
            )
        return results

    except Exception as e:
        print(f"Detection Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/suggest-model")
async def suggest_model(file: UploadFile = File(...)):
    try:
        content = await file.read()
        df = load_dataframe(file.filename, content)
        
        summary = extract_dataset_summary(df)
        recommendation = get_anomaly_recommendation(summary)
        
        return {
            "status": "success",
            "file_name": file.filename,
            "recommendation": recommendation
        }

    except Exception as e:
        print(f"Suggestion Error Traceback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model Suggestion Failed: {str(e)}")


@app.on_event("startup")
def startup_db_check():
    try:
        Base.metadata.create_all(bind=engine)
        print("PostgreSQL Database Connected & Tables Synced Successfully!")
    except Exception as e:
        print(f"Database Connection Error: {str(e)}")