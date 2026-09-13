import uuid
import enum
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class ExerciseType(str, enum.Enum):
    WALKING = "walking"
    CYCLING = "cycling"
    SWIMMING = "swimming"
    STRENGTH = "strength"
    YOGA = "yoga"
    CUSTOM = "custom"


class ExerciseIntensity(str, enum.Enum):
    LIGHT = "light"
    MODERATE = "moderate"
    VIGOROUS = "vigorous"


# Rough MET-based multiplier per exercise type, used for calorie auto-calculation.
# kcal = MET * weight_kg * duration_hours (simplified, ignores intensity fine-tuning beyond a small bump)
MET_VALUES = {
    ExerciseType.WALKING: 3.5,
    ExerciseType.CYCLING: 6.0,
    ExerciseType.SWIMMING: 6.5,
    ExerciseType.STRENGTH: 5.0,
    ExerciseType.YOGA: 2.5,
    ExerciseType.CUSTOM: 4.0,
}

INTENSITY_MULTIPLIER = {
    ExerciseIntensity.LIGHT: 0.8,
    ExerciseIntensity.MODERATE: 1.0,
    ExerciseIntensity.VIGOROUS: 1.3,
}


class ExerciseLog(Base):
    """One logged workout — powers 'Recent Workouts' and weekly exercise goal progress."""
    __tablename__ = "exercise_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    exercise_type = Column(Enum(ExerciseType), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    distance_km = Column(Float, nullable=True)
    intensity = Column(Enum(ExerciseIntensity), nullable=False, default=ExerciseIntensity.MODERATE)
    notes = Column(String, nullable=True)
    calories_kcal = Column(Float, nullable=False)

    log_date = Column(Date, nullable=False)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())


class DailyActivitySummary(Base):
    """Daily step/distance/calorie totals — powers the top ring on the Activity screen.
    Populated manually for now (or by a future HealthKit/Google Fit sync)."""
    __tablename__ = "daily_activity_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    summary_date = Column(Date, nullable=False)
    steps = Column(Integer, nullable=False, default=0)
    distance_km = Column(Float, nullable=False, default=0)
    calories_kcal = Column(Float, nullable=False, default=0)
    active_minutes = Column(Integer, nullable=False, default=0)
    steps_goal = Column(Integer, nullable=False, default=10000)
