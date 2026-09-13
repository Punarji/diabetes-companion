import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.medication import MedicationLog, MedicationLogStatus
from app.models.meal_log import MealLog
from app.models.exercise_log import ExerciseLog
from app.models.glucose_reading import GlucoseReading
from app.models.hba1c_result import Hba1cResult
from app.models.achievement import UserAchievement, Achievement

PERIOD_DAYS = {"week": 7, "month": 30, "3months": 90}


def _date_range(period: str, end: date | None = None):
    end = end or date.today()
    days = PERIOD_DAYS.get(period, 7)
    start = end - timedelta(days=days - 1)
    return start, end


def _medication_adherence(db: Session, patient_id: uuid.UUID, start: date, end: date) -> int:
    logs = (
        db.query(MedicationLog)
        .filter(
            MedicationLog.patient_id == patient_id,
            MedicationLog.log_date >= start,
            MedicationLog.log_date <= end,
        )
        .all()
    )
    if not logs:
        return 0
    taken = sum(1 for log in logs if log.status == MedicationLogStatus.TAKEN)
    return round((taken / len(logs)) * 100)


def _dietary_adherence(db: Session, patient_id: uuid.UUID, start: date, end: date) -> int:
    total_days = (end - start).days + 1
    logged_days = (
        db.query(MealLog.log_date)
        .filter(MealLog.patient_id == patient_id, MealLog.log_date >= start, MealLog.log_date <= end)
        .distinct()
        .count()
    )
    return round(min(logged_days / total_days, 1.0) * 100)


def _activity_adherence(db: Session, patient_id: uuid.UUID, start: date, end: date) -> int:
    total_days = (end - start).days + 1
    logged_days = (
        db.query(ExerciseLog.log_date)
        .filter(ExerciseLog.patient_id == patient_id, ExerciseLog.log_date >= start, ExerciseLog.log_date <= end)
        .distinct()
        .count()
    )
    return round(min(logged_days / total_days, 1.0) * 100)


def _glucose_adherence(db: Session, patient_id: uuid.UUID, start: date, end: date) -> int:
    total_days = (end - start).days + 1
    from datetime import datetime
    count = (
        db.query(GlucoseReading)
        .filter(
            GlucoseReading.patient_id == patient_id,
            GlucoseReading.recorded_at >= datetime.combine(start, datetime.min.time()),
            GlucoseReading.recorded_at <= datetime.combine(end, datetime.max.time()),
        )
        .count()
    )
    return round(min(count / total_days, 1.0) * 100)


def _health_score(med: int, dietary: int, activity: int, glucose: int) -> int:
    return round(med * 0.30 + dietary * 0.25 + activity * 0.20 + glucose * 0.25)


def _health_score_label(score: int) -> str:
    if score >= 80:
        return "Excellent"
    if score >= 60:
        return "Good"
    if score >= 40:
        return "Fair"
    return "Needs Attention"


def _hba1c_data(db: Session, patient_id: uuid.UUID):
    results = (
        db.query(Hba1cResult)
        .filter(Hba1cResult.patient_id == patient_id)
        .order_by(Hba1cResult.recorded_at.desc())
        .limit(3)
        .all()
    )
    results = list(reversed(results))  # oldest to newest for the chart
    history = [{"month_label": r.recorded_at.strftime("%b"), "value_percent": r.value_percent} for r in results]
    latest = results[-1].value_percent if results else None

    trend_label = None
    if len(results) >= 2 and results[-1].value_percent < results[-2].value_percent:
        trend_label = "Improving trend — keep it up!"
    elif len(results) >= 2 and results[-1].value_percent > results[-2].value_percent:
        trend_label = "Trending up — talk to your doctor about adjustments."

    return latest, history, trend_label


def _recent_achievements(db: Session, patient_id: uuid.UUID, limit: int = 5):
    rows = (
        db.query(UserAchievement)
        .filter(UserAchievement.patient_id == patient_id)
        .order_by(UserAchievement.earned_at.desc())
        .limit(limit)
        .all()
    )
    return rows


def get_progress_summary(db: Session, patient_id: uuid.UUID, period: str = "week"):
    from app.schemas.progress import AdherenceCategory, AchievementEarned, ProgressSummaryOut

    start, end = _date_range(period)
    prev_start, prev_end = _date_range(period, end=start - timedelta(days=1))

    med = _medication_adherence(db, patient_id, start, end)
    dietary = _dietary_adherence(db, patient_id, start, end)
    activity = _activity_adherence(db, patient_id, start, end)
    glucose = _glucose_adherence(db, patient_id, start, end)
    score = _health_score(med, dietary, activity, glucose)

    prev_med = _medication_adherence(db, patient_id, prev_start, prev_end)
    prev_dietary = _dietary_adherence(db, patient_id, prev_start, prev_end)
    prev_activity = _activity_adherence(db, patient_id, prev_start, prev_end)
    prev_glucose = _glucose_adherence(db, patient_id, prev_start, prev_end)
    prev_score = _health_score(prev_med, prev_dietary, prev_activity, prev_glucose)

    hba1c_latest, hba1c_history, hba1c_trend = _hba1c_data(db, patient_id)

    achievement_rows = _recent_achievements(db, patient_id)
    achievements = [
        AchievementEarned(
            id=row.id,
            title=row.achievement.title,
            description=row.achievement.description,
            emoji=row.achievement.emoji,
            earned_at=row.earned_at,
        )
        for row in achievement_rows
    ]

    return ProgressSummaryOut(
        period=period,
        health_score=score,
        health_score_label=_health_score_label(score),
        health_score_delta=score - prev_score,
        adherence=[
            AdherenceCategory(label="Medication", icon="💊", percent=med, color="green"),
            AdherenceCategory(label="Dietary", icon="🍽️", percent=dietary, color="amber"),
            AdherenceCategory(label="Activity", icon="🏃", percent=activity, color="green"),
            AdherenceCategory(label="Glucose Monitoring", icon="🩸", percent=glucose, color="purple"),
        ],
        hba1c_latest=hba1c_latest,
        hba1c_target=7.0,
        hba1c_history=hba1c_history,
        hba1c_trend_label=hba1c_trend,
        achievements=achievements,
    )
