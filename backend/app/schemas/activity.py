import uuid
from datetime import date, datetime
from pydantic import BaseModel
from app.models.exercise_log import ExerciseType, ExerciseIntensity


class ExerciseLogCreate(BaseModel):
    """'Save Workout' on the Log Exercise screen."""
    exercise_type: ExerciseType
    duration_minutes: int
    distance_km: float | None = None
    intensity: ExerciseIntensity = ExerciseIntensity.MODERATE
    notes: str | None = None
    log_date: date


class ExerciseLogOut(BaseModel):
    id: uuid.UUID
    exercise_type: ExerciseType
    duration_minutes: int
    distance_km: float | None
    intensity: ExerciseIntensity
    notes: str | None
    calories_kcal: float
    log_date: date
    logged_at: datetime

    class Config:
        from_attributes = True


class DailyActivitySummaryOut(BaseModel):
    """Powers the top ring + stats row on the Activity screen."""
    steps: int
    steps_goal: int
    steps_percent: int
    distance_km: float
    calories_kcal: float
    active_minutes: int


class WeeklyExerciseGoalOut(BaseModel):
    label: str            # "Moderate Aerobic Activity"
    minutes_done: int
    minutes_goal: int
    minutes_remaining: int


class ActivityScreenOut(BaseModel):
    """Full payload for the Activity tab: ring + weekly goal + recent workouts."""
    today: DailyActivitySummaryOut
    weekly_goal: WeeklyExerciseGoalOut
    recent_workouts: list[ExerciseLogOut]
