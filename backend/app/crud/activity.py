import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.exercise_log import ExerciseLog, DailyActivitySummary, MET_VALUES, INTENSITY_MULTIPLIER
from app.models.patient_profile import PatientProfile
from app.schemas.activity import ExerciseLogCreate

DEFAULT_WEIGHT_KG = 70  # fallback if the patient hasn't set a weight yet


def _calculate_calories(db: Session, patient_id: uuid.UUID, payload: ExerciseLogCreate) -> float:
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
    weight_kg = (profile.weight_kg if profile and profile.weight_kg else DEFAULT_WEIGHT_KG)

    met = MET_VALUES[payload.exercise_type]
    multiplier = INTENSITY_MULTIPLIER[payload.intensity]
    hours = payload.duration_minutes / 60
    return round(met * multiplier * weight_kg * hours, 0)


def create_exercise_log(db: Session, patient_id: uuid.UUID, payload: ExerciseLogCreate) -> ExerciseLog:
    calories = _calculate_calories(db, patient_id, payload)
    log = ExerciseLog(
        patient_id=patient_id,
        exercise_type=payload.exercise_type,
        duration_minutes=payload.duration_minutes,
        distance_km=payload.distance_km,
        intensity=payload.intensity,
        notes=payload.notes,
        calories_kcal=calories,
        log_date=payload.log_date,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    _update_daily_summary(db, patient_id, payload.log_date)
    return log


def _update_daily_summary(db: Session, patient_id: uuid.UUID, log_date: date) -> DailyActivitySummary:
    summary = (
        db.query(DailyActivitySummary)
        .filter(DailyActivitySummary.patient_id == patient_id, DailyActivitySummary.summary_date == log_date)
        .first()
    )
    if not summary:
        summary = DailyActivitySummary(patient_id=patient_id, summary_date=log_date)
        db.add(summary)

    day_logs = (
        db.query(ExerciseLog)
        .filter(ExerciseLog.patient_id == patient_id, ExerciseLog.log_date == log_date)
        .all()
    )
    summary.active_minutes = sum(l.duration_minutes for l in day_logs)
    summary.calories_kcal = sum(l.calories_kcal for l in day_logs)
    summary.distance_km = sum(l.distance_km or 0 for l in day_logs)
    db.commit()
    db.refresh(summary)
    return summary


def get_or_create_daily_summary(db: Session, patient_id: uuid.UUID, for_date: date) -> DailyActivitySummary:
    summary = (
        db.query(DailyActivitySummary)
        .filter(DailyActivitySummary.patient_id == patient_id, DailyActivitySummary.summary_date == for_date)
        .first()
    )
    if not summary:
        summary = DailyActivitySummary(patient_id=patient_id, summary_date=for_date)
        db.add(summary)
        db.commit()
        db.refresh(summary)
    return summary


def get_recent_workouts(db: Session, patient_id: uuid.UUID, limit: int = 10) -> list[ExerciseLog]:
    return (
        db.query(ExerciseLog)
        .filter(ExerciseLog.patient_id == patient_id)
        .order_by(ExerciseLog.logged_at.desc())
        .limit(limit)
        .all()
    )


def get_weekly_exercise_minutes(db: Session, patient_id: uuid.UUID, goal_minutes: int = 150) -> dict:
    start = date.today() - timedelta(days=date.today().weekday())  # Monday of current week
    logs = (
        db.query(ExerciseLog)
        .filter(
            ExerciseLog.patient_id == patient_id,
            ExerciseLog.log_date >= start,
            ExerciseLog.log_date <= date.today(),
            ExerciseLog.intensity.in_(["moderate", "vigorous"]),
        )
        .all()
    )
    minutes_done = sum(l.duration_minutes for l in logs)
    return {
        "label": "Moderate Aerobic Activity",
        "minutes_done": minutes_done,
        "minutes_goal": goal_minutes,
        "minutes_remaining": max(0, goal_minutes - minutes_done),
    }
