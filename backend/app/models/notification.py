import uuid
import enum
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class NotificationType(str, enum.Enum):
    GLUCOSE_ALERT = "glucose_alert"
    MEDICATION_REMINDER = "medication_reminder"
    MEAL_REMINDER = "meal_reminder"
    ACHIEVEMENT = "achievement"
    DOCTOR_UPDATE = "doctor_update"


class Notification(Base):
    """One row per notification feed item — powers the Notifications screen."""
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)          # "High Glucose Alert"
    message = Column(String, nullable=False)          # "Your post-meal reading was 224 mg/dL..."
    icon = Column(String, nullable=True)                # emoji or icon key

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
