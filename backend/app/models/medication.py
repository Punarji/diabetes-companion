import uuid
import enum
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, JSON, Time, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class MedicationLogStatus(str, enum.Enum):
    PENDING = "pending"
    TAKEN = "taken"
    SKIPPED = "skipped"


class Medication(Base):
    """A prescribed medication with one or more daily scheduled doses."""
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    prescribed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    name = Column(String, nullable=False)          # "Metformin"
    dosage = Column(String, nullable=False)         # "500mg"
    frequency_label = Column(String, nullable=False)  # "Twice daily"
    instructions = Column(String, nullable=True)     # "With meals" / "Before breakfast"
    icon = Column(String, nullable=True, default="pill")  # "pill" | "syringe"

    dose_times = Column(JSON, nullable=False, default=list)  # ["08:00", "19:00"]

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", back_populates="medications", foreign_keys=[patient_id])
    logs = relationship("MedicationLog", back_populates="medication", cascade="all, delete-orphan")


class MedicationLog(Base):
    """One row per scheduled dose per day - drives 'Today's Medications' + adherence %."""
    __tablename__ = "medication_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medication_id = Column(UUID(as_uuid=True), ForeignKey("medications.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    log_date = Column(Date, nullable=False)          # which day this dose belongs to
    scheduled_time = Column(Time, nullable=False)     # 08:00
    status = Column(Enum(MedicationLogStatus), nullable=False, default=MedicationLogStatus.PENDING)
    taken_at = Column(DateTime(timezone=True), nullable=True)  # "Taken at 8:15 AM"
    notes = Column(String, nullable=True)

    medication = relationship("Medication", back_populates="logs")


# --- Fields added for the Medication Detail screen ---
from sqlalchemy import Column as _Column, String as _String, Boolean as _Boolean
Medication.description = _Column(_String, nullable=True)
Medication.drug_class = _Column(_String, nullable=True)
Medication.side_effects = _Column(JSON, nullable=False, default=list)
Medication.refill_reminder_enabled = _Column(_Boolean, default=True)
