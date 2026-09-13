import uuid
from datetime import date, datetime
from pydantic import BaseModel


class AdherenceCategory(BaseModel):
    label: str          # "Medication"
    icon: str
    percent: int
    color: str


class Hba1cPoint(BaseModel):
    month_label: str      # "Jul"
    value_percent: float


class AchievementEarned(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    emoji: str
    earned_at: datetime | None


class ProgressSummaryOut(BaseModel):
    period: str                     # "week" | "month" | "3months"
    health_score: int
    health_score_label: str          # "Good"
    health_score_delta: int            # +8 pts from last period
    adherence: list[AdherenceCategory]
    hba1c_latest: float | None
    hba1c_target: float
    hba1c_history: list[Hba1cPoint]
    hba1c_trend_label: str | None      # "Improving trend — keep it up!"
    achievements: list[AchievementEarned]
