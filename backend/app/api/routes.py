import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.recommendation import RecommendationResponse
from ml.dataset_helper import extract_dataset_summary
from ml.groq_service import get_anomaly_recommendation

router = APIRouter()

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/suggest-anomaly-model", response_model=RecommendationResponse)
async def suggest_model_endpoint(file: UploadFile = File(...)):
    # File extension validate karein
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Sirf .csv, .xlsx, aur .xls files allowed hain."
        )
    
    # Temporary file save karein
    temp_file_path = os.path.join(TEMP_DIR, file.filename)
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Dataset summary extract karein
        summary = extract_dataset_summary(temp_file_path)
        
        # 2. Groq AI se recommendation lein
        ai_recommendation = get_anomaly_recommendation(summary)
        
        return RecommendationResponse(
            status="success",
            file_name=file.filename,
            recommendation=ai_recommendation
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)