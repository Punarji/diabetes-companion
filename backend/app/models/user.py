import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class UserRole(str, enum.Enum):
    PATIENT = "patient"
    PHYSICIAN = "physician"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)  # from Create Account screen
    role = Column(Enum(UserRole), nullable=False, default=UserRole.PATIENT)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    physician_profile = relationship("PhysicianProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", foreign_keys="Medication.patient_id", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="patient", cascade="all, delete-orphan")
    care_plans = relationship("CarePlan", back_populates="patient", foreign_keys="CarePlan.patient_id", cascade="all, delete-orphan")
    notification_preference = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


# --- Fields for Edit Profile / Profile & Settings screens ---
from sqlalchemy import Column as _Column, String as _String, Boolean as _Boolean
User.gender = _Column(_String, nullable=True)
User.phone_number = _Column(_String, nullable=True)
User.avatar_url = _Column(_String, nullable=True)
User.push_notifications_enabled = _Column(_Boolean, default=True)
User.email_alerts_enabled = _Column(_Boolean, default=False)
