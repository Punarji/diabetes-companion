import uuid
from sqlalchemy.orm import Session
from app.models.risk_assessment import RiskAssessment, RiskLevel
from app.schemas.risk_assessment import RiskAssessmentSubmit
from app.core.risk_questions import QUESTIONS_BY_ID


def _age_band_points(age: int) -> tuple[int, str]:
    if age < 35:
        return 0, f"Age {age}"
    if age < 45:
        return 1, "Age 35-44"
    if age < 55:
        return 2, "Age 45-54"
    if age < 65:
        return 3, "Age 55-64"
    return 4, "Age 65+"


def _bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


def compute_risk_assessment(patient_id: uuid.UUID, payload: RiskAssessmentSubmit) -> dict:
    hp = payload.health_profile
    bmi = _bmi(hp.weight_kg, hp.height_cm)

    score = 0
    factors: list[str] = []

    age_points, age_label = _age_band_points(hp.age)
    score += age_points
    if age_points > 0:
        factors.append(age_label)

    if bmi >= 30:
        score += 3
        factors.append("BMI Obese")
    elif bmi >= 25:
        score += 1
        factors.append("BMI Overweight")

    if hp.family_history in ("yes_parent", "yes_sibling"):
        score += 3
        factors.append("Family History")

    if hp.smoking_status == "current":
        score += 2
        factors.append("Current Smoker")

    # questionnaire answers
    low_activity_flagged = False
    for q_id, answer_value in payload.answers.items():
        question = QUESTIONS_BY_ID.get(q_id)
        if not question:
            continue
        option = next((o for o in question["options"] if o["value"] == answer_value), None)
        if option:
            score += option["points"]
            if q_id == "q7" and answer_value == "no":
                low_activity_flagged = True

    if low_activity_flagged:
        factors.append("Low Activity")

    score = min(score, 26)

    if score <= 6:
        risk_level = RiskLevel.LOW
    elif score <= 14:
        risk_level = RiskLevel.MODERATE
    elif score <= 20:
        risk_level = RiskLevel.HIGH
    else:
        risk_level = RiskLevel.LIKELY_T2DM

    actions_by_level = {
        RiskLevel.LOW: [
            "Maintain your current healthy habits",
            "Repeat this assessment annually",
        ],
        RiskLevel.MODERATE: [
            "Schedule a fasting blood glucose test",
            "Reduce daily carbohydrate intake",
            "Start 150 min/week moderate exercise",
            "Monitor weight weekly",
        ],
        RiskLevel.HIGH: [
            "Schedule a fasting blood glucose test within 2 weeks",
            "Consult a doctor for a full diabetes screening",
            "Reduce daily carbohydrate and sugar intake",
            "Start 150 min/week moderate exercise",
        ],
        RiskLevel.LIKELY_T2DM: [
            "Consult a doctor as soon as possible",
            "Request an HbA1c test",
            "Begin daily glucose monitoring",
            "Review current medications with your physician",
        ],
    }

    return {
        "age": hp.age,
        "bmi": str(bmi),
        "family_history": hp.family_history,
        "smoking_status": hp.smoking_status,
        "answers": payload.answers,
        "risk_score": score,
        "risk_score_max": 26,
        "risk_level": risk_level,
        "risk_factors": factors,
        "recommended_actions": actions_by_level[risk_level],
    }


def create_risk_assessment(db: Session, patient_id: uuid.UUID, payload: RiskAssessmentSubmit) -> RiskAssessment:
    computed = compute_risk_assessment(patient_id, payload)
    assessment = RiskAssessment(patient_id=patient_id, **computed)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def get_latest_assessment(db: Session, patient_id: uuid.UUID) -> RiskAssessment | None:
    return (
        db.query(RiskAssessment)
        .filter(RiskAssessment.patient_id == patient_id)
        .order_by(RiskAssessment.created_at.desc())
        .first()
    )
