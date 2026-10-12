from pydantic import BaseModel
class RecommendationResponse(BaseModel):
    status:str
    file_name: str
    recommendation: str