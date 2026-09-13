import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.physician import MyPatientsOut
from app.crud.physician import get_my_patients

router = APIRouter(prefix="/api/v1/physician", tags=["physician"])


def _require_physician(current_user):
    if current_user.role.value != "physician":
        raise HTTPException(status_code=403, detail="Physician access only")


@router.get("/patients", response_model=MyPatientsOut)
def my_patients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the 'My Patients' dashboard on the physician portal."""
    _require_physician(current_user)
    return get_my_patients(db, current_user.id)


from app.schemas.prescription import PrescriptionSubmit, PrescriptionResultOut
from app.crud.prescription import submit_prescription


@router.post("/patients/{patient_id}/prescriptions", response_model=PrescriptionResultOut, status_code=201)
def create_prescription(
    patient_id: uuid.UUID,
    payload: PrescriptionSubmit,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """'Generate Care Plan for Patient' — the New Prescription form submission."""
    _require_physician(current_user)
    return submit_prescription(db, patient_id, current_user.id, payload)


from app.schemas.patient_report import PatientReportOut, UpdateDoctorNotesRequest
from app.crud.patient_report import get_patient_report, update_doctor_notes


@router.get("/patients/{patient_id}/report", response_model=PatientReportOut)
def patient_report(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Powers the Patient Report screen."""
    _require_physician(current_user)
    report = get_patient_report(db, patient_id)
    if not report:
        raise HTTPException(status_code=404, detail="Patient not found")
    return report


@router.patch("/patients/{patient_id}/notes")
def update_patient_notes(
    patient_id: uuid.UUID,
    payload: UpdateDoctorNotesRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """'Update Plan' — saving doctor notes on the Patient Report screen."""
    _require_physician(current_user)
    success = update_doctor_notes(db, patient_id, payload.doctor_notes)
    if not success:
        raise HTTPException(status_code=404, detail="No active care plan found for this patient")
    return {"status": "updated"}
