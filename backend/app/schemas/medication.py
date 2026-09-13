import uuid
from datetime import datetime, time
from pydantic import BaseModel
from app.models.medication import MedicationLogStatus


class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency_label: str
    instructions: str | None = None
    icon: str = "pill"
    dose_times: list[str]   # ["08:00", "19:00"]


class MedicationOut(BaseModel):
    id: uuid.UUID
    name: str
    dosage: str
    frequency_label: str
    instructions: str | None
    icon: str | None
    dose_times: list[str]
    is_active: bool

    class Config:
        from_attributes = True


class MedicationLogOut(BaseModel):
    """One dose row shown under a medication card, e.g. 'Morning 8AM'."""
    id: uuid.UUID
    medication_id: uuid.UUID
    medication_name: str
    dosage: str
    scheduled_time: time
    status: MedicationLogStatus
    taken_at: datetime | None

    class Config:
        from_attributes = True


class TodayMedicationsResponse(BaseModel):
    """Powers the 'Today' tab: adherence ring + list of medication cards."""
    adherence_percent: int
    doses_taken: int
    doses_total: int
    medications: list[MedicationOut]
    logs: list[MedicationLogOut]


class LogDoseRequest(BaseModel):
    """'Log Metformin 500mg' bottom-sheet — Confirm or Skip Dose."""
    actual_time_taken: time | None = None   # None when skipping
    notes: str | None = None
    skipped: bool = False


class SideEffectItem(BaseModel):
    label: str
    severity: str   # "common" | "uncommon" | "rare_seek_help"


class MedicationDetailOut(BaseModel):
    id: uuid.UUID
    name: str
    dosage: str
    drug_class: str | None
    description: str | None
    frequency_label: str
    instructions: str | None
    dose_times: list[str]
    side_effects: list[SideEffectItem]
    refill_reminder_enabled: bool

    class Config:
        from_attributes = True
