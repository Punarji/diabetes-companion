import uuid
from sqlalchemy.orm import Session
from app.models.notification_preference import NotificationPreference
from app.schemas.reminder import ReminderSettingsUpdate


def get_or_create_preference(db: Session, user_id: uuid.UUID) -> NotificationPreference:
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
    if not pref:
        pref = NotificationPreference(user_id=user_id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


def update_preference(db: Session, user_id: uuid.UUID, payload: ReminderSettingsUpdate) -> NotificationPreference:
    pref = get_or_create_preference(db, user_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(pref, field, value)
    db.commit()
    db.refresh(pref)
    return pref
