import uuid
from datetime import datetime
from pydantic import BaseModel


class DoctorInfoOut(BaseModel):
    physician_id: uuid.UUID | None
    full_name: str
    specialization: str | None
    clinic_name: str | None
    email: str | None
    phone_number: str | None


class AppointmentOut(BaseModel):
    id: uuid.UUID
    scheduled_at: datetime
    note: str | None
    is_upcoming: bool

    class Config:
        from_attributes = True


class MyDoctorOut(BaseModel):
    doctor: DoctorInfoOut | None
    upcoming_appointment: AppointmentOut | None
    past_appointments: list[AppointmentOut]
