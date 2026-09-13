import uuid
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.models.care_plan import CarePlan, CarePlanTask, CarePlanTaskLog, TimeOfDay
from app.schemas.care_plan import ToggleTaskRequest


def get_active_plan(db: Session, patient_id: uuid.UUID) -> CarePlan | None:
    return (
        db.query(CarePlan)
        .filter(CarePlan.patient_id == patient_id, CarePlan.is_active == True)  # noqa: E712
        .order_by(CarePlan.created_at.desc())
        .first()
    )


def _day_completion(db: Session, plan: CarePlan, day: date) -> tuple[int, int]:
    task_ids = [t.id for t in plan.tasks]
    if not task_ids:
        return 0, 0
    logs = (
        db.query(CarePlanTaskLog)
        .filter(CarePlanTaskLog.task_id.in_(task_ids), CarePlanTaskLog.log_date == day)
        .all()
    )
    completed = sum(1 for log in logs if log.is_completed)
    return completed, len(task_ids)


def build_week_strip(db: Session, plan: CarePlan, selected_date: date) -> list[dict]:
    monday = selected_date - timedelta(days=selected_date.weekday())
    strip = []
    for i in range(7):
        day = monday + timedelta(days=i)
        completed, total = _day_completion(db, plan, day)
        if day == date.today():
            status = "today"
        elif day > date.today():
            status = "upcoming"
        elif total > 0 and completed == total:
            status = "complete"
        elif day < date.today():
            status = "missed" if total > 0 and completed < total else "upcoming"
        else:
            status = "upcoming"
        strip.append({
            "date": day,
            "label": day.strftime("%a"),
            "day_number": day.day,
            "status": status,
        })
    return strip


def calculate_streak(db: Session, plan: CarePlan) -> int:
    streak = 0
    day = date.today()
    while True:
        completed, total = _day_completion(db, plan, day)
        if total > 0 and completed == total:
            streak += 1
            day -= timedelta(days=1)
        else:
            break
    return streak


def get_tasks_for_date(db: Session, plan: CarePlan, selected_date: date, time_of_day: TimeOfDay) -> list[dict]:
    tasks = [t for t in plan.tasks if t.time_of_day == time_of_day]
    result = []
    for task in tasks:
        log = (
            db.query(CarePlanTaskLog)
            .filter(CarePlanTaskLog.task_id == task.id, CarePlanTaskLog.log_date == selected_date)
            .first()
        )
        result.append({
            "id": task.id,
            "task_type": task.task_type,
            "time_of_day": task.time_of_day,
            "scheduled_time": task.scheduled_time,
            "title": task.title,
            "detail": task.detail,
            "is_completed": bool(log and log.is_completed),
        })
    return sorted(result, key=lambda t: t["scheduled_time"])


def toggle_task(db: Session, task_id: uuid.UUID, patient_id: uuid.UUID, payload: ToggleTaskRequest) -> CarePlanTaskLog:
    log = (
        db.query(CarePlanTaskLog)
        .filter(CarePlanTaskLog.task_id == task_id, CarePlanTaskLog.log_date == payload.log_date)
        .first()
    )
    if not log:
        log = CarePlanTaskLog(task_id=task_id, patient_id=patient_id, log_date=payload.log_date)
        db.add(log)

    log.is_completed = payload.is_completed
    log.completed_at = datetime.utcnow() if payload.is_completed else None
    db.commit()
    db.refresh(log)
    return log


def week_number(plan: CarePlan, selected_date: date) -> int:
    delta_days = (selected_date - plan.start_date).days
    return max(1, (delta_days // 7) + 1)
