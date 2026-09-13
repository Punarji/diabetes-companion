import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.medication import (
    MedicationCreate, MedicationOut, TodayMedicationsResponse, LogDoseRequest, MedicationLogOut,
    MedicationDetailOut,
)
from app.crud.medication import create_medication, get_today_data, log_dose

router = APIRouter(prefix="/api/v1/medications", tags=["medications"])


@router.post("", response_model=MedicationOut, status_code=201)
def add_medication(data: MedicationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """The '+' button on the Medications screen."""
    return create_medication(db, current_user.id, data)


@router.get("/today", response_model=TodayMedicationsResponse)
def today_medications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the 'Today' tab: adherence ring + medication cards."""
    medications, logs, adherence, taken, total = get_today_data(db, current_user.id)
    return TodayMedicationsResponse(
        adherence_percent=adherence,
        doses_taken=taken,
        doses_total=total,
        medications=medications,
        logs=[
            MedicationLogOut(
                id=log.id,
                medication_id=log.medication_id,
                medication_name=log.medication.name,
                dosage=log.medication.dosage,
                scheduled_time=log.scheduled_time,
                status=log.status,
                taken_at=log.taken_at,
            )
            for log in logs
        ],
    )


@router.post("/logs/{log_id}", response_model=MedicationLogOut)
def submit_dose_log(log_id: uuid.UUID, payload: LogDoseRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """'Confirm' or 'Skip Dose' on the Log Medication bottom sheet."""
    log = log_dose(db, log_id, current_user.id, payload)
    if not log:
        raise HTTPException(status_code=404, detail="Dose log not found")
    return MedicationLogOut(
        id=log.id,
        medication_id=log.medication_id,
        medication_name=log.medication.name,
        dosage=log.medication.dosage,
        scheduled_time=log.scheduled_time,
        status=log.status,
        taken_at=log.taken_at,
    )


@router.get("/{medication_id}", response_model=MedicationDetailOut)
def medication_detail(medication_id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the Medication Detail screen (e.g. 'Metformin 500mg')."""
    from app.crud.medication import get_medication_detail
    med = get_medication_detail(db, medication_id, current_user.id)
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    return MedicationDetailOut(
        id=med.id,
        name=med.name,
        dosage=med.dosage,
        drug_class=med.drug_class,
        description=med.description,
        frequency_label=med.frequency_label,
        instructions=med.instructions,
        dose_times=med.dose_times,
        side_effects=med.side_effects or [],
        refill_reminder_enabled=med.refill_reminder_enabled,
    )
