import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.risk_assessment import RiskLevel


class RiskQuestionOptionOut(BaseModel):
    value: str
    label: str


class RiskQuestionOut(BaseModel):
    """One question for the 'Question X of 12' screen."""
    id: str
    order: int
    prompt: str
    options: list[RiskQuestionOptionOut]


class HealthProfileRiskInput(BaseModel):
    """'Your Health Profile' step (age slider, family history, smoking) before the questionnaire."""
    age: int
    weight_kg: float
    height_cm: float
    family_history: str   # "yes_parent" | "yes_sibling" | "no"
    smoking_status: str   # "non_smoker" | "ex_smoker" | "current"


class RiskAssessmentSubmit(BaseModel):
    """Full submission: health profile + all 12 answers -> triggers 'Analysing Your Data'."""
    health_profile: HealthProfileRiskInput
    answers: dict[str, str]   # {"q1": "yes_frequently", ...}


class RiskAssessmentResult(BaseModel):
    """'Your diabetes risk score is 14/26' result screen."""
    id: uuid.UUID
    risk_score: int
    risk_score_max: int
    risk_level: RiskLevel
    risk_factors: list[str]
    recommended_actions: list[str]
    created_at: datetime

    class Config:
        from_attributes = True
