import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.notification import Notification


def _day_group(created_at, today: date) -> str:
    created_date = created_at.date()
    if created_date == today:
        return "Today"
    if created_date == today - timedelta(days=1):
        return "Yesterday"
    return "Earlier"


def get_notifications(db: Session, patient_id: uuid.UUID, limit: int = 50):
    from app.schemas.notification import NotificationOut, NotificationListOut

    rows = (
        db.query(Notification)
        .filter(Notification.patient_id == patient_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )

    today = date.today()
    unread_count = sum(1 for n in rows if not n.is_read)

    notifications = [
        NotificationOut(
            id=n.id,
            notification_type=n.notification_type,
            title=n.title,
            message=n.message,
            icon=n.icon,
            is_read=n.is_read,
            created_at=n.created_at,
            day_group=_day_group(n.created_at, today),
        )
        for n in rows
    ]

    return NotificationListOut(unread_count=unread_count, notifications=notifications)


def mark_all_read(db: Session, patient_id: uuid.UUID) -> int:
    updated = (
        db.query(Notification)
        .filter(Notification.patient_id == patient_id, Notification.is_read == False)  # noqa: E712
        .update({"is_read": True})
    )
    db.commit()
    return updated


def mark_one_read(db: Session, patient_id: uuid.UUID, notification_id: uuid.UUID) -> bool:
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.patient_id == patient_id)
        .first()
    )
    if not notif:
        return False
    notif.is_read = True
    db.commit()
    return True
