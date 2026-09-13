import uuid
from datetime import date, datetime, time, timedelta
from sqlalchemy.orm import Session
from app.models.medication import Medication, MedicationLog, MedicationLogStatus
from app.schemas.medication import MedicationCreate, LogDoseRequest


def create_medication(db: Session, patient_id: uuid.UUID, data: MedicationCreate, prescribed_by_id: uuid.UUID | None = None) -> Medication:
    med = Medication(
        patient_id=patient_id,
        prescribed_by_id=prescribed_by_id,
        name=data.name,
        dosage=data.dosage,
        frequency_label=data.frequency_label,
        instructions=data.instructions,
        icon=data.icon,
        dose_times=data.dose_times,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    _ensure_logs_for_date(db, med, date.today())
    return med


def _ensure_logs_for_date(db: Session, medication: Medication, log_date: date) -> None:
    """Create pending MedicationLog rows for a medication's dose_times on a given date, if missing."""
    existing_times = {
        log.scheduled_time
        for log in db.query(MedicationLog)
        .filter(MedicationLog.medication_id == medication.id, MedicationLog.log_date == log_date)
        .all()
    }
    for time_str in medication.dose_times:
        hh, mm = map(int, time_str.split(":"))
        scheduled = time(hour=hh, minute=mm)
        if scheduled not in existing_times:
            db.add(
                MedicationLog(
                    medication_id=medication.id,
                    patient_id=medication.patient_id,
                    log_date=log_date,
                    scheduled_time=scheduled,
                    status=MedicationLogStatus.PENDING,
                )
            )
    db.commit()


def get_today_data(db: Session, patient_id: uuid.UUID, for_date: date | None = None):
    for_date = for_date or date.today()

    medications = (
        db.query(Medication)
        .filter(Medication.patient_id == patient_id, Medication.is_active == True)  # noqa: E712
        .all()
    )
    for med in medications:
        _ensure_logs_for_date(db, med, for_date)

    logs = (
        db.query(MedicationLog)
        .filter(MedicationLog.patient_id == patient_id, MedicationLog.log_date == for_date)
        .order_by(MedicationLog.scheduled_time)
        .all()
    )

    doses_total = len(logs)
    doses_taken = sum(1 for log in logs if log.status == MedicationLogStatus.TAKEN)
    adherence_percent = int(round((doses_taken / doses_total) * 100)) if doses_total else 0

    return medications, logs, adherence_percent, doses_taken, doses_total


def log_dose(db: Session, log_id: uuid.UUID, patient_id: uuid.UUID, payload: LogDoseRequest) -> MedicationLog | None:
    log = (
        db.query(MedicationLog)
        .filter(MedicationLog.id == log_id, MedicationLog.patient_id == patient_id)
        .first()
    )
    if not log:
        return None

    if payload.skipped:
        log.status = MedicationLogStatus.SKIPPED
        log.taken_at = None
    else:
        log.status = MedicationLogStatus.TAKEN
        actual_time = payload.actual_time_taken or datetime.now().time()
        log.taken_at = datetime.combine(log.log_date, actual_time)

    log.notes = payload.notes
    db.commit()
    db.refresh(log)
    return log


def week_adherence(db: Session, patient_id: uuid.UUID) -> int:
    """'This Week's Adherence' — % taken over the last 7 days."""
    start = date.today() - timedelta(days=6)
    logs = (
        db.query(MedicationLog)
        .filter(
            MedicationLog.patient_id == patient_id,
            MedicationLog.log_date >= start,
            MedicationLog.log_date <= date.today(),
        )
        .all()
    )
    if not logs:
        return 0
    taken = sum(1 for log in logs if log.status == MedicationLogStatus.TAKEN)
    return int(round((taken / len(logs)) * 100))


# Fallback reference data for common drugs — used only when a medication's
# description/drug_class/side_effects are empty (e.g. added without full details).
KNOWN_DRUG_INFO = {
    "metformin": {
        "description": "Helps control blood sugar levels by reducing glucose production in the liver and improving insulin sensitivity.",
        "drug_class": "Biguanide",
        "side_effects": [
            {"label": "Nausea or stomach upset", "severity": "common"},
            {"label": "Diarrhea", "severity": "common"},
            {"label": "Metallic taste in mouth", "severity": "common"},
            {"label": "Loss of appetite", "severity": "uncommon"},
            {"label": "Lactic acidosis", "severity": "rare_seek_help"},
        ],
    },
}


def get_medication_detail(db: Session, medication_id: uuid.UUID, patient_id: uuid.UUID) -> Medication | None:
    med = (
        db.query(Medication)
        .filter(Medication.id == medication_id, Medication.patient_id == patient_id)
        .first()
    )
    if not med:
        return None

    known = KNOWN_DRUG_INFO.get(med.name.strip().lower())
    if known:
        if not med.description:
            med.description = known["description"]
        if not med.drug_class:
            med.drug_class = known["drug_class"]
        if not med.side_effects:
            med.side_effects = known["side_effects"]

    return med
