import io
import pandas as pd
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.ml.isolation_forest import execute_isolation_forest
from app.ml.lof import execute_lof
from app.ml.oc_svm import execute_oc_svm

app = FastAPI(title="SentinelAI - Multi-Model Anomaly Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_dataframe(file_name: str, content: bytes) -> pd.DataFrame:
    """
    Helper function: Reads CSV or Excel file bytes into Pandas DataFrame.
    """
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


@app.get("/")
def read_root():
    return {"message": "SentinelAI Isolation Forest Engine is Active"}


@app.post("/api/detect-anomalies")
async def detect_anomalies(
    file: UploadFile = File(...),
    algorithm: str = Form("isolation_forest"),
    contamination: float = Form(0.05),
    n_estimators: int = Form(100),
    n_neighbors: int = Form(20),
    kernel: str=Form("rdf")
):
    try:
        content = await file.read()
        df = load_dataframe(file.filename, content)

        if algorithm == "lof":
            results = execute_lof(
                df = df,
                contamination = contamination,
                n_neighbors = n_neighbors
            )
        elif algorithm == "oc_svm":
            results = execute_oc_svm(
                df = df,
                contamination = contamination,
                kernel = kernel
            )
        else:
            results = execute_isolation_forest(
                df = df,
                contamination = contamination,
                n_estimators=n_estimators
            )
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
