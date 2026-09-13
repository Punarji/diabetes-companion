import uuid
from sqlalchemy import Column, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class Hba1cResult(Base):
    """Lab HbA1c % result — powers the Home dashboard's 'HbA1c Last Result' stat."""
    __tablename__ = "hba1c_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    value_percent = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
