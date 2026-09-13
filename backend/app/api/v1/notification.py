import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.notification import NotificationListOut
from app.crud.notification import get_notifications, mark_all_read, mark_one_read

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListOut)
def list_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the Notifications screen."""
    return get_notifications(db, current_user.id)


@router.post("/mark-all-read")
def mark_all_notifications_read(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """'Mark all read' link at the top of the Notifications screen."""
    count = mark_all_read(db, current_user.id)
    return {"marked_read": count}


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Tapping an individual notification card."""
    success = mark_one_read(db, current_user.id, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "read"}
