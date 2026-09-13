import uuid
from sqlalchemy import Column, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    medication_reminders = Column(Boolean, default=True)
    glucose_reminders = Column(Boolean, default=True)
    meal_reminders = Column(Boolean, default=True)
    activity_reminders = Column(Boolean, default=False)

    user = relationship("User", back_populates="notification_preference")


# --- Granular toggles for the Reminder Settings screen ---
from sqlalchemy import Column as _Column, Boolean as _Boolean
NotificationPreference.morning_dose_reminder = _Column(_Boolean, default=True)
NotificationPreference.evening_dose_reminder = _Column(_Boolean, default=True)
NotificationPreference.missed_dose_alert = _Column(_Boolean, default=True)
NotificationPreference.fasting_glucose_reminder = _Column(_Boolean, default=True)
NotificationPreference.post_meal_glucose_reminder = _Column(_Boolean, default=True)
NotificationPreference.meal_log_reminder = _Column(_Boolean, default=True)
NotificationPreference.exercise_nudge = _Column(_Boolean, default=False)
