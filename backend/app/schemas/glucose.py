import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.glucose_reading import GlucoseReadingType


class GlucoseReadingCreate(BaseModel):
    """'Save Reading' on the Log Glucose screen."""
    reading_type: GlucoseReadingType
    value_mg_dl: float
    meal_reference: str | None = None
    notes: str | None = None
    recorded_at: datetime | None = None   # None = use server time (now)


class GlucoseFeedback(BaseModel):
    label: str        # "Slightly above post-meal target"
    severity: str       # "low" | "normal" | "warning" | "high"


class GlucoseReadingOut(BaseModel):
    id: uuid.UUID
    reading_type: GlucoseReadingType
    value_mg_dl: float
    meal_reference: str | None
    notes: str | None
    recorded_at: datetime
    feedback: GlucoseFeedback

    class Config:
        from_attributes = True


class GlucoseChartDay(BaseModel):
    day_label: str          # "Mon", "Tue", ...
    date_str: str
    average_value: float | None
    status: str               # "in_range" | "high" | "very_high" | "no_data"


class GlucoseAlert(BaseModel):
    time_label: str          # "Thu 8AM"
    value_mg_dl: float
    message: str               # "Above post-meal target of 180 mg/dL"


class TodayReadingItem(BaseModel):
    label: str               # "Fasting", "Post-breakfast", "Post-lunch"
    time_label: str | None
    value_mg_dl: float | None
    status_label: str          # "In Range" | "Borderline" | "High" | "Pending"


class GlucoseSummaryOut(BaseModel):
    period: str                          # "7d" | "30d" | "90d"
    average_value: float
    time_in_range_percent: int
    chart_days: list[GlucoseChartDay]
    alert: GlucoseAlert | None
    today_readings: list[TodayReadingItem]
