import uuid
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.hba1c_result import Hba1cResult
from app.models.medication import MedicationLog, MedicationLogStatus
from app.models.glucose_reading import GlucoseReading, GlucoseReadingType
from app.models.care_plan import CarePlan


def _medication_adherence_30d(db: Session, patient_id: uuid.UUID) -> int:
    start = date.today() - timedelta(days=29)
    logs = (
        db.query(MedicationLog)
        .filter(MedicationLog.patient_id == patient_id, MedicationLog.log_date >= start)
        .all()
    )
    if not logs:
        return 0
    taken = sum(1 for log in logs if log.status == MedicationLogStatus.TAKEN)
    return round((taken / len(logs)) * 100)


def _glucose_patterns_30d(db: Session, patient_id: uuid.UUID):
    start = datetime.combine(date.today() - timedelta(days=29), datetime.min.time())
    readings = (
        db.query(GlucoseReading)
        .filter(GlucoseReading.patient_id == patient_id, GlucoseReading.recorded_at >= start)
        .all()
    )

    fasting = [r.value_mg_dl for r in readings if r.reading_type == GlucoseReadingType.FASTING]
    post_meal = [r.value_mg_dl for r in readings if r.reading_type == GlucoseReadingType.POST_MEAL]
    hyper_events = sum(1 for r in readings if r.value_mg_dl >= 200)

    avg_fasting = round(sum(fasting) / len(fasting)) if fasting else None
    avg_post_meal = round(sum(post_meal) / len(post_meal)) if post_meal else None

    time_in_range_count = sum(1 for r in readings if 70 <= r.value_mg_dl <= 180)
    time_in_range_percent = round((time_in_range_count / len(readings)) * 100) if readings else 0

    return fasting, post_meal, avg_fasting, avg_post_meal, hyper_events, time_in_range_percent


def get_patient_report(db: Session, patient_id: uuid.UUID):
    from app.schemas.patient_report import GlucosePatternRow, PatientReportOut

    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        return None

    hba1c_latest_row = (
        db.query(Hba1cResult)
        .filter(Hba1cResult.patient_id == patient_id)
        .order_by(Hba1cResult.recorded_at.desc())
        .first()
    )
    hba1c_latest = hba1c_latest_row.value_percent if hba1c_latest_row else None

    med_adherence = _medication_adherence_30d(db, patient_id)
    fasting, post_meal, avg_fasting, avg_post_meal, hyper_events, time_in_range = _glucose_patterns_30d(db, patient_id)

    patterns = []
    if avg_fasting is not None:
        status = "In Range" if avg_fasting <= 130 else "Borderline" if avg_fasting <= 160 else "Review"
        color = "green" if status == "In Range" else "amber" if status == "Borderline" else "red"
        patterns.append(GlucosePatternRow(label="Average Fasting", value=f"{avg_fasting} mg/dL", status_label=status, status_color=color))
    if avg_post_meal is not None:
        status = "In Range" if avg_post_meal <= 160 else "Borderline" if avg_post_meal <= 200 else "Review"
        color = "green" if status == "In Range" else "amber" if status == "Borderline" else "red"
        patterns.append(GlucosePatternRow(label="Average Post-meal", value=f"{avg_post_meal} mg/dL", status_label=status, status_color=color))
    patterns.append(GlucosePatternRow(
        label="Hyperglycemia Events",
        value=f"{hyper_events} events",
        status_label="Review" if hyper_events > 0 else "None",
        status_color="red" if hyper_events > 0 else "green",
    ))

    active_plan = (
        db.query(CarePlan)
        .filter(CarePlan.patient_id == patient_id, CarePlan.is_active == True)  # noqa: E712
        .order_by(CarePlan.created_at.desc())
        .first()
    )
    doctor_notes = active_plan.doctor_notes if active_plan else None

    return PatientReportOut(
        patient_id=patient.id,
        patient_name=patient.full_name,
        report_month_label=date.today().strftime("%b %Y"),
        hba1c_latest=hba1c_latest,
        medication_adherence_percent=med_adherence,
        time_in_range_percent=time_in_range,
        glucose_patterns=patterns,
        doctor_notes=doctor_notes,
    )


def update_doctor_notes(db: Session, patient_id: uuid.UUID, notes: str) -> bool:
    active_plan = (
        db.query(CarePlan)
        .filter(CarePlan.patient_id == patient_id, CarePlan.is_active == True)  # noqa: E712
        .order_by(CarePlan.created_at.desc())
        .first()
    )
    if not active_plan:
        return False
    active_plan.doctor_notes = notes
    db.commit()
    return True
