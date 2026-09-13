import uuid
from pydantic import BaseModel
from app.models.patient_profile import (
    DiabetesStatus, ActivityLevel, FamilyHistory,
    SmokingStatus, AlcoholUse, DietaryHabit, PreferredLanguage,
)


class HealthProfileStep1(BaseModel):
    """'Tell us about yourself' — Step 1 of 3."""
    diabetes_status: DiabetesStatus
    weight_kg: float
    height_cm: float
    physical_activity_level: ActivityLevel
    family_history_diabetes: FamilyHistory


class LifestyleStep2(BaseModel):
    """'Lifestyle & Preferences' — Step 2 of 3."""
    smoking_status: SmokingStatus
    alcohol_use: AlcoholUse
    dietary_habit: DietaryHabit
    preferred_language: PreferredLanguage


class PatientProfileOut(BaseModel):
    id: uuid.UUID
    diabetes_status: DiabetesStatus | None
    weight_kg: float | None
    height_cm: float | None
    physical_activity_level: ActivityLevel | None
    family_history_diabetes: FamilyHistory | None
    smoking_status: SmokingStatus | None
    alcohol_use: AlcoholUse | None
    dietary_habit: DietaryHabit | None
    preferred_language: PreferredLanguage | None
    bmi: float | None
    bmi_category: str | None

    class Config:
        from_attributes = True


class NotificationPreferenceIn(BaseModel):
    """Step 3 of 3 — Notifications."""
    medication_reminders: bool = True
    glucose_reminders: bool = True
    meal_reminders: bool = True
    activity_reminders: bool = False


class NotificationPreferenceOut(NotificationPreferenceIn):
    class Config:
        from_attributes = True
