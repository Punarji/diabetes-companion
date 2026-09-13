import uuid
import enum
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Date, Time, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class TimeOfDay(str, enum.Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"


class CarePlanTaskType(str, enum.Enum):
    GLUCOSE = "glucose"
    MEDICATION = "medication"
    MEAL = "meal"
    ACTIVITY = "activity"


class CarePlan(Base):
    """A physician-generated, multi-week day-by-day management plan."""
    __tablename__ = "care_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    prescribed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    start_date = Column(Date, nullable=False)
    duration_weeks = Column(Integer, nullable=False, default=12)  # "Week 3 of 12"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", back_populates="care_plans", foreign_keys=[patient_id])
    tasks = relationship("CarePlanTask", back_populates="care_plan", cascade="all, delete-orphan")


class CarePlanTask(Base):
    """A recurring daily task within the plan, e.g. 'Fasting Blood Glucose - 7:00 AM'."""
    __tablename__ = "care_plan_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    care_plan_id = Column(UUID(as_uuid=True), ForeignKey("care_plans.id"), nullable=False)

    task_type = Column(Enum(CarePlanTaskType), nullable=False)
    time_of_day = Column(Enum(TimeOfDay), nullable=False)
    scheduled_time = Column(Time, nullable=False)
    title = Column(String, nullable=False)         # "Fasting Blood Glucose"
    detail = Column(String, nullable=True)          # "Target < 100 mg/dL" / "With food"

    care_plan = relationship("CarePlan", back_populates="tasks")
    logs = relationship("CarePlanTaskLog", back_populates="task", cascade="all, delete-orphan")


class CarePlanTaskLog(Base):
    """Completion record for a task on a specific date - powers the checkmarks + weekly streak."""
    __tablename__ = "care_plan_task_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("care_plan_tasks.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    log_date = Column(Date, nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    task = relationship("CarePlanTask", back_populates="logs")


# --- Doctor notes for the Patient Report screen ---
from sqlalchemy import Column as _Column3, String as _String3
CarePlan.doctor_notes = _Column3(_String3, nullable=True)
