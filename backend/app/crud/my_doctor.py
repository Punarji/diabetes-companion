import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.patient_profile import PatientProfile
from app.models.physician_profile import PhysicianProfile
from app.models.appointment import Appointment


def get_my_doctor_data(db: Session, patient_id: uuid.UUID):
    from app.schemas.my_doctor import DoctorInfoOut, AppointmentOut, MyDoctorOut

    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()

    doctor = None
    if profile and profile.linked_physician_id:
        phys_profile = (
            db.query(PhysicianProfile)
            .filter(PhysicianProfile.id == profile.linked_physician_id)
            .first()
        )
        if phys_profile:
            phys_user = db.query(User).filter(User.id == phys_profile.user_id).first()
            doctor = DoctorInfoOut(
                physician_id=phys_user.id if phys_user else None,
                full_name=phys_user.full_name if phys_user else "Doctor",
                specialization=phys_profile.specialization,
                clinic_name=phys_profile.hospital_affiliation,
                email=phys_user.email if phys_user else None,
                phone_number=phys_user.phone_number if phys_user else None,
            )

    now = datetime.now(timezone.utc)
    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .order_by(Appointment.scheduled_at.desc())
        .all()
    )

    upcoming = None
    past = []
    for appt in appointments:
        appt_time = appt.scheduled_at if appt.scheduled_at.tzinfo else appt.scheduled_at.replace(tzinfo=timezone.utc)
        is_upcoming = appt_time >= now
        appt_out = AppointmentOut(id=appt.id, scheduled_at=appt.scheduled_at, note=appt.note, is_upcoming=is_upcoming)
        if is_upcoming and upcoming is None:
            upcoming = appt_out
        elif not is_upcoming:
            past.append(appt_out)

    return MyDoctorOut(doctor=doctor, upcoming_appointment=upcoming, past_appointments=past)
