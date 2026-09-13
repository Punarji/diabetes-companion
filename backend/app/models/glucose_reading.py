import uuid
import enum
from sqlalchemy import Column, Float, String, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class GlucoseReadingType(str, enum.Enum):
    FASTING = "fasting"
    POST_MEAL = "post_meal"
    RANDOM = "random"
    BEDTIME = "bedtime"


class GlucoseReading(Base):
    """Glucose log entry — powers both the Home dashboard's 'Fasting Glucose' stat
    and the dedicated Log Glucose screen (reading type, meal reference, notes)."""
    __tablename__ = "glucose_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    reading_type = Column(Enum(GlucoseReadingType), nullable=False, default=GlucoseReadingType.FASTING)
    value_mg_dl = Column(Float, nullable=False)
    meal_reference = Column(String, nullable=True)   # "After Lunch", "Before Dinner", etc.
    notes = Column(String, nullable=True)             # "How are you feeling?"
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
