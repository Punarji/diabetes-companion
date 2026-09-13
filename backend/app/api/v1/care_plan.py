import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.care_plan import TimeOfDay
from app.schemas.care_plan import CarePlanOut, ToggleTaskRequest
from app.crud.care_plan import (
    get_active_plan, build_week_strip, calculate_streak, get_tasks_for_date, toggle_task, week_number,
)

router = APIRouter(prefix="/api/v1/care-plan", tags=["care-plan"])


@router.get("", response_model=CarePlanOut)
def get_my_care_plan(
    for_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Full 'My Care Plan' screen for the selected day in the weekly strip."""
    plan = get_active_plan(db, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="No active care plan. Ask your physician to create one.")

    return CarePlanOut(
        id=plan.id,
        week_number=week_number(plan, for_date),
        duration_weeks=plan.duration_weeks,
        streak_days=calculate_streak(db, plan),
        week_strip=build_week_strip(db, plan, for_date),
        morning_tasks=get_tasks_for_date(db, plan, for_date, TimeOfDay.MORNING),
        afternoon_tasks=get_tasks_for_date(db, plan, for_date, TimeOfDay.AFTERNOON),
        evening_tasks=get_tasks_for_date(db, plan, for_date, TimeOfDay.EVENING),
    )


@router.post("/tasks/{task_id}/toggle")
def toggle_care_plan_task(
    task_id: uuid.UUID,
    payload: ToggleTaskRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Tapping a checkmark circle next to any task on the plan."""
    log = toggle_task(db, task_id, current_user.id, payload)
    return {"task_id": task_id, "log_date": log.log_date, "is_completed": log.is_completed}
