import uuid
from datetime import datetime
from pydantic import BaseModel


class AchievementOut(BaseModel):
    id: uuid.UUID
    code: str
    title: str
    emoji: str
    description: str
    next_milestone_hint: str | None
    earned_at: datetime | None = None   # None if listed but not yet earned

    class Config:
        from_attributes = True
