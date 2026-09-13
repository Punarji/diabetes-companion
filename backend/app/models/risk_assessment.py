import uuid
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    LIKELY_T2DM = "likely_t2dm"


class RiskAssessment(Base):
    """
    One row per completed risk questionnaire.
    Maps to: 'Your Health Profile' (age/BMI/family history/smoking) +
    the 12-question FINDRISC-style questionnaire +
    the 'Your diabetes risk score' result screen.
    """
    __tablename__ = "risk_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    age = Column(Integer, nullable=False)
    bmi = Column(String, nullable=True)  # snapshot at time of assessment, stored as computed value
    family_history = Column(String, nullable=True)
    smoking_status = Column(String, nullable=True)

    # raw answers to the 12 questions: {"q1": "yes_frequently", "q2": "...", ...}
    answers = Column(JSON, nullable=False, default=dict)

    risk_score = Column(Integer, nullable=False)       # e.g. 14
    risk_score_max = Column(Integer, nullable=False, default=26)
    risk_level = Column(Enum(RiskLevel), nullable=False)

    risk_factors = Column(JSON, nullable=False, default=list)        # ["BMI Overweight", "Family History", ...]
    recommended_actions = Column(JSON, nullable=False, default=list)  # ["Schedule a fasting blood glucose test", ...]

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", back_populates="risk_assessments")
