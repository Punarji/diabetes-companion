import uuid
from datetime import date, time
from pydantic import BaseModel
from app.models.care_plan import TimeOfDay, CarePlanTaskType


class CarePlanTaskOut(BaseModel):
    id: uuid.UUID
    task_type: CarePlanTaskType
    time_of_day: TimeOfDay
    scheduled_time: time
    title: str
    detail: str | None
    is_completed: bool   # for the selected log_date

    class Config:
        from_attributes = True


class WeekDayStatus(BaseModel):
    """One dot in the Mon-Sun strip at the top of the screen."""
    date: date
    label: str          # "Mon", "Tue", ...
    day_number: int      # 18, 19, ...
    status: str           # "complete" | "missed" | "today" | "upcoming"


class CarePlanOut(BaseModel):
    """Full 'My Care Plan' screen payload for a given date."""
    id: uuid.UUID
    week_number: int
    duration_weeks: int
    streak_days: int
    week_strip: list[WeekDayStatus]
    morning_tasks: list[CarePlanTaskOut]
    afternoon_tasks: list[CarePlanTaskOut]
    evening_tasks: list[CarePlanTaskOut]


class ToggleTaskRequest(BaseModel):
    log_date: date
    is_completed: bool
