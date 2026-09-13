import uuid
from datetime import datetime
from pydantic import BaseModel


class ReminderItem(BaseModel):
    id: str
    icon: str            # "medication" | "meal" | "glucose"
    title: str
    subtitle: str
    time_label: str
    is_completed: bool


class AppointmentSummary(BaseModel):
    id: uuid.UUID | None
    physician_name: str
    scheduled_at: datetime
    location_or_note: str | None = None


class HealthScoreBreakdown(BaseModel):
    score: int                    # 72
    medication_percent: int        # 66
    meals_percent: int             # 33
    tasks_remaining: int            # 3


class DashboardOut(BaseModel):
    """Powers the entire Home tab in one call."""
    greeting: str                 # "Good Morning"
    full_name: str
    fasting_glucose: float | None
    fasting_glucose_unit: str = "mg/dL"
    hba1c_last_result: float | None
    steps_today: int
    health_score: HealthScoreBreakdown
    todays_reminders: list[ReminderItem]
    next_appointment: AppointmentSummary | None
    unread_notifications: int
