from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.risk_questions import RISK_QUESTIONS
from app.schemas.risk_assessment import RiskQuestionOut, RiskAssessmentSubmit, RiskAssessmentResult
from app.crud.risk_assessment import create_risk_assessment, get_latest_assessment

router = APIRouter(prefix="/api/v1/risk-assessment", tags=["risk-assessment"])


@router.get("/questions", response_model=list[RiskQuestionOut])
def list_questions():
    """Feeds the 'Question X of 12' screen."""
    return RISK_QUESTIONS


@router.post("/submit", response_model=RiskAssessmentResult, status_code=201)
def submit_assessment(payload: RiskAssessmentSubmit, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Called after the last question is answered — backs the 'Analysing Your Data' screen,
    and the response feeds the risk score result screen."""
    return create_risk_assessment(db, current_user.id, payload)


@router.get("/latest", response_model=RiskAssessmentResult)
def latest_assessment(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    assessment = get_latest_assessment(db, current_user.id)
    if not assessment:
        raise HTTPException(status_code=404, detail="No risk assessment found")
    return assessment
