import uuid
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.glucose_reading import GlucoseReading, GlucoseReadingType
from app.models.hba1c_result import Hba1cResult
from app.models.appointment import Appointment
from app.models.medication import MedicationLog, MedicationLogStatus
from app.models.care_plan import CarePlanTaskLog
from app.crud.care_plan import get_active_plan, get_tasks_for_date
from app.models.care_plan import TimeOfDay


def _greeting() -> str:
    hour = datetime.now().hour
    if hour < 12:
        return "Good Morning"
    if hour < 17:
        return "Good Afternoon"
    return "Good Evening"


def get_dashboard(db: Session, user: User) -> dict:
    today = date.today()

    latest_fasting = (
        db.query(GlucoseReading)
        .filter(GlucoseReading.patient_id == user.id, GlucoseReading.reading_type == GlucoseReadingType.FASTING)
        .order_by(GlucoseReading.recorded_at.desc())
        .first()
    )
    latest_hba1c = (
        db.query(Hba1cResult)
        .filter(Hba1cResult.patient_id == user.id)
        .order_by(Hba1cResult.recorded_at.desc())
        .first()
    )

    # medication progress today
    med_logs = (
        db.query(MedicationLog)
        .filter(MedicationLog.patient_id == user.id, MedicationLog.log_date == today)
        .all()
    )
    med_total = len(med_logs)
    med_taken = sum(1 for log in med_logs if log.status == MedicationLogStatus.TAKEN)
    med_percent = int(round((med_taken / med_total) * 100)) if med_total else 0

    reminders = []
    for log in sorted(med_logs, key=lambda l: l.scheduled_time):
        reminders.append({
            "id": str(log.id),
            "icon": "medication",
            "title": f"{log.medication.name} {log.medication.dosage}",
            "subtitle": log.medication.instructions or "",
            "time_label": log.scheduled_time.strftime("%I:%M %p").lstrip("0"),
            "is_completed": log.status == MedicationLogStatus.TAKEN,
        })

    # care plan meal/activity tasks feed into reminders + meals progress
    meals_percent = 0
    tasks_remaining = 0
    plan = get_active_plan(db, user.id)
    if plan:
        all_tasks = (
            get_tasks_for_date(db, plan, today, TimeOfDay.MORNING)
            + get_tasks_for_date(db, plan, today, TimeOfDay.AFTERNOON)
            + get_tasks_for_date(db, plan, today, TimeOfDay.EVENING)
        )
        meal_tasks = [t for t in all_tasks if str(t["task_type"]) in ("meal", "TaskType.MEAL", "CarePlanTaskType.MEAL") or getattr(t["task_type"], "value", "") == "meal"]
        if meal_tasks:
            completed_meals = sum(1 for t in meal_tasks if t["is_completed"])
            meals_percent = int(round((completed_meals / len(meal_tasks)) * 100))
        tasks_remaining = sum(1 for t in all_tasks if not t["is_completed"]) + (med_total - med_taken)
        for t in all_tasks:
            if getattr(t["task_type"], "value", "") in ("meal", "glucose"):
                reminders.append({
                    "id": str(t["id"]),
                    "icon": getattr(t["task_type"], "value", "meal"),
                    "title": t["title"],
                    "subtitle": t["detail"] or "",
                    "time_label": t["scheduled_time"].strftime("%I:%M %p").lstrip("0"),
                    "is_completed": t["is_completed"],
                })
    else:
        tasks_remaining = med_total - med_taken

    health_score = min(100, int(round((med_percent * 0.6) + (meals_percent * 0.4))))

    upcoming_appt = (
        db.query(Appointment)
        .filter(Appointment.patient_id == user.id, Appointment.scheduled_at >= datetime.utcnow())
        .order_by(Appointment.scheduled_at.asc())
        .first()
    )

    return {
        "greeting": _greeting(),
        "full_name": user.full_name.split(" ")[0],
        "fasting_glucose": latest_fasting.value_mg_dl if latest_fasting else None,
        "hba1c_last_result": latest_hba1c.value_percent if latest_hba1c else None,
        "steps_today": 0,  # populate once a wearable/steps integration exists
        "health_score": {
            "score": health_score,
            "medication_percent": med_percent,
            "meals_percent": meals_percent,
            "tasks_remaining": tasks_remaining,
        },
        "todays_reminders": sorted(reminders, key=lambda r: r["time_label"]),
        "next_appointment": {
            "id": upcoming_appt.id,
            "physician_name": upcoming_appt.physician_display_name,
            "scheduled_at": upcoming_appt.scheduled_at,
            "location_or_note": upcoming_appt.note,
        } if upcoming_appt else None,
        "unread_notifications": 0,
    }
