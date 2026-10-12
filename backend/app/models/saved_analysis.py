from sqlalchemy import (
    Column, Integer, String, DateTime, Numeric,
    LargeBinary, ForeignKey, func,
)
from app.database import Base


class SavedAnalysis(Base):
    __tablename__ = "saved_analyses"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    file_name = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False, default="csv")
    file_data = Column(LargeBinary, nullable=False)

    model_name = Column(String(50), nullable=False)
    contamination = Column(Numeric(3, 2))
    total_records = Column(Integer)
    anomalies_found = Column(Integer)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )