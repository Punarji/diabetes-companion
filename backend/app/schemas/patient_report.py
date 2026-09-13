import uuid
from pydantic import BaseModel


class GlucosePatternRow(BaseModel):
    label: str          # "Average Fasting"
    value: str             # "112 mg/dL" or "3 events"
    status_label: str        # "In Range" | "Borderline" | "Review"
    status_color: str          # "green" | "amber" | "red"


class PatientReportOut(BaseModel):
    patient_id: uuid.UUID
    patient_name: str
    report_month_label: str      # "Jan 2026"
    hba1c_latest: float | None
    medication_adherence_percent: int
    time_in_range_percent: int
    glucose_patterns: list[GlucosePatternRow]
    doctor_notes: str | None


class UpdateDoctorNotesRequest(BaseModel):
    doctor_notes: str
