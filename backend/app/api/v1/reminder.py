from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.reminder import ReminderSettingsOut, ReminderSettingsUpdate
from app.crud.reminder import get_or_create_preference, update_preference

router = APIRouter(prefix="/api/v1/reminders", tags=["reminders"])


@router.get("", response_model=ReminderSettingsOut)
def get_reminder_settings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the Reminder Settings screen on load."""
    return get_or_create_preference(db, current_user.id)


@router.patch("", response_model=ReminderSettingsOut)
def update_reminder_settings(
    payload: ReminderSettingsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Toggling any switch on the Reminder Settings screen."""
    return update_preference(db, current_user.id, payload)
