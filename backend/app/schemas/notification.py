import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.notification import NotificationType


class NotificationOut(BaseModel):
    id: uuid.UUID
    notification_type: NotificationType
    title: str
    message: str
    icon: str | None
    is_read: bool
    created_at: datetime
    day_group: str   # "Today" | "Yesterday" | "Earlier"

    class Config:
        from_attributes = True


class NotificationListOut(BaseModel):
    unread_count: int
    notifications: list[NotificationOut]
