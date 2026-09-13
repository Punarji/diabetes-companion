from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.patient_profile import (
    HealthProfileStep1, LifestyleStep2, PatientProfileOut,
    NotificationPreferenceIn, NotificationPreferenceOut,
)
from app.crud.patient_profile import save_step1, save_step2, save_notification_preference

router = APIRouter(prefix="/api/v1/patient-profile", tags=["patient-profile"])


@router.post("/health-profile", response_model=PatientProfileOut)
def submit_health_profile(data: HealthProfileStep1, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Step 1 of 3 — 'Tell us about yourself'."""
    return save_step1(db, current_user.id, data)


@router.post("/lifestyle", response_model=PatientProfileOut)
def submit_lifestyle(data: LifestyleStep2, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Step 2 of 3 — 'Lifestyle & Preferences'."""
    return save_step2(db, current_user.id, data)


@router.post("/notifications", response_model=NotificationPreferenceOut)
def submit_notifications(data: NotificationPreferenceIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Step 3 of 3 — 'Choose which reminders you want to receive'."""
    return save_notification_preference(db, current_user.id, data)
