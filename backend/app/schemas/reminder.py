from pydantic import BaseModel


class ReminderSettingsOut(BaseModel):
    """Full 'Reminder Settings' screen state."""
    morning_dose_reminder: bool
    evening_dose_reminder: bool
    missed_dose_alert: bool
    fasting_glucose_reminder: bool
    post_meal_glucose_reminder: bool
    meal_log_reminder: bool
    exercise_nudge: bool

    class Config:
        from_attributes = True


class ReminderSettingsUpdate(BaseModel):
    """Partial update — toggling a single switch sends just that field."""
    morning_dose_reminder: bool | None = None
    evening_dose_reminder: bool | None = None
    missed_dose_alert: bool | None = None
    fasting_glucose_reminder: bool | None = None
    post_meal_glucose_reminder: bool | None = None
    meal_log_reminder: bool | None = None
    exercise_nudge: bool | None = None
