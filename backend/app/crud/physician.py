import uuid
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.patient_profile import PatientProfile, DiabetesStatus
from app.models.physician_profile import PhysicianProfile
from app.models.hba1c_result import Hba1cResult

CONDITION_LABELS = {
    DiabetesStatus.NOT_DIAGNOSED: "Not Diagnosed",
    DiabetesStatus.PREDIABETES: "Prediabetes",
    DiabetesStatus.TYPE_2_DM: "T2DM",
}


def _initials(full_name: str) -> str:
    parts = full_name.strip().split()
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][0].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def get_my_patients(db: Session, physician_user_id: uuid.UUID):
    from app.schemas.physician import PatientListItem, MyPatientsOut

    phys_profile = (
        db.query(PhysicianProfile)
        .filter(PhysicianProfile.user_id == physician_user_id)
        .first()
    )
    if not phys_profile:
        return MyPatientsOut(total_patients=0, alerts_today=0, on_track_count=0, patients=[])

    patient_profiles = (
        db.query(PatientProfile)
        .filter(PatientProfile.linked_physician_id == phys_profile.id)
        .all()
    )

    patients_out = []
    alerts_today = 0
    on_track_count = 0

    for pp in patient_profiles:
        user = db.query(User).filter(User.id == pp.user_id).first()
        if not user:
            continue

        hba1c_results = (
            db.query(Hba1cResult)
            .filter(Hba1cResult.patient_id == pp.user_id)
            .order_by(Hba1cResult.recorded_at.desc())
            .limit(2)
            .all()
        )
        latest = hba1c_results[0].value_percent if hba1c_results else None
        prev = hba1c_results[1].value_percent if len(hba1c_results) > 1 else None

        if latest is not None and latest >= 8.0:
            status_label, status_color = "Needs Attention", "red"
            alerts_today += 1
        elif latest is not None and prev is not None and (prev - latest) >= 0.3:
            status_label, status_color = "Good Progress", "green"
            on_track_count += 1
        else:
            status_label, status_color = "On Track", "teal"
            on_track_count += 1

        patients_out.append(PatientListItem(
            id=user.id,
            initials=_initials(user.full_name),
            full_name=user.full_name,
            condition_label=CONDITION_LABELS.get(pp.diabetes_status, "Not Diagnosed"),
            status_label=status_label,
            status_color=status_color,
            hba1c_latest=latest,
        ))

    return MyPatientsOut(
        total_patients=len(patient_profiles),
        alerts_today=alerts_today,
        on_track_count=on_track_count,
        patients=patients_out,
    )
