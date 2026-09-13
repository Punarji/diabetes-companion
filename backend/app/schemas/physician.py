import uuid
from pydantic import BaseModel


class PatientListItem(BaseModel):
    id: uuid.UUID
    initials: str
    full_name: str
    condition_label: str      # "T2DM" | "Prediabetes" | "Not Diagnosed"
    status_label: str           # "On Track" | "Needs Attention" | "Good Progress"
    status_color: str             # "teal" | "red" | "green"
    hba1c_latest: float | None


class MyPatientsOut(BaseModel):
    total_patients: int
    alerts_today: int
    on_track_count: int
    patients: list[PatientListItem]
