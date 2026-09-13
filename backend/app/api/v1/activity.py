from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.activity import ExerciseLogCreate, ExerciseLogOut, ActivityScreenOut
from app.crud.activity import (
    create_exercise_log, get_or_create_daily_summary, get_recent_workouts, get_weekly_exercise_minutes,
)
from app.crud.achievement import check_and_award_streak_achievements

router = APIRouter(prefix="/api/v1/activity", tags=["activity"])


@router.get("", response_model=ActivityScreenOut)
def get_activity_screen(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Full 'Activity' tab: ring, weekly goal, recent workouts."""
    today = date.today()
    summary = get_or_create_daily_summary(db, current_user.id, today)
    weekly = get_weekly_exercise_minutes(db, current_user.id)
    workouts = get_recent_workouts(db, current_user.id)

    steps_percent = int(round((summary.steps / summary.steps_goal) * 100)) if summary.steps_goal else 0

    return ActivityScreenOut(
        today={
            "steps": summary.steps,
            "steps_goal": summary.steps_goal,
            "steps_percent": steps_percent,
            "distance_km": summary.distance_km,
            "calories_kcal": summary.calories_kcal,
            "active_minutes": summary.active_minutes,
        },
        weekly_goal=weekly,
        recent_workouts=workouts,
    )


@router.post("/exercise", response_model=ExerciseLogOut, status_code=201)
def log_exercise(payload: ExerciseLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """'Save Workout' on the Log Exercise screen. Calories are auto-calculated server-side."""
    log = create_exercise_log(db, current_user.id, payload)
    check_and_award_streak_achievements(db, current_user.id)
    return log
