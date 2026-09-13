import uuid
from sqlalchemy.orm import Session
from app.models.patient_profile import PatientProfile
from app.models.notification_preference import NotificationPreference
from app.schemas.patient_profile import HealthProfileStep1, LifestyleStep2, NotificationPreferenceIn


def get_or_create_profile(db: Session, patient_id: uuid.UUID) -> PatientProfile:
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
    if not profile:
        profile = PatientProfile(user_id=patient_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def save_step1(db: Session, patient_id: uuid.UUID, data: HealthProfileStep1) -> PatientProfile:
    profile = get_or_create_profile(db, patient_id)
    profile.diabetes_status = data.diabetes_status
    profile.weight_kg = data.weight_kg
    profile.height_cm = data.height_cm
    profile.physical_activity_level = data.physical_activity_level
    profile.family_history_diabetes = data.family_history_diabetes
    db.commit()
    db.refresh(profile)
    return profile


def save_step2(db: Session, patient_id: uuid.UUID, data: LifestyleStep2) -> PatientProfile:
    profile = get_or_create_profile(db, patient_id)
    profile.smoking_status = data.smoking_status
    profile.alcohol_use = data.alcohol_use
    profile.dietary_habit = data.dietary_habit
    profile.preferred_language = data.preferred_language
    db.commit()
    db.refresh(profile)
    return profile


def get_or_create_notification_preference(db: Session, user_id: uuid.UUID) -> NotificationPreference:
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
    if not pref:
        pref = NotificationPreference(user_id=user_id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


def save_notification_preference(db: Session, user_id: uuid.UUID, data: NotificationPreferenceIn) -> NotificationPreference:
    pref = get_or_create_notification_preference(db, user_id)
    pref.medication_reminders = data.medication_reminders
    pref.glucose_reminders = data.glucose_reminders
    pref.meal_reminders = data.meal_reminders
    pref.activity_reminders = data.activity_reminders
    db.commit()
    db.refresh(pref)
    return pref
