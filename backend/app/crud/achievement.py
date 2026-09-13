import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.achievement import Achievement, UserAchievement
from app.models.care_plan import CarePlanTaskLog, CarePlanTask, CarePlan


def list_achievements_for_user(db: Session, patient_id: uuid.UUID) -> list[dict]:
    """Returns every catalog achievement, with earned_at populated if the user has it."""
    all_achievements = db.query(Achievement).all()
    earned = {
        ua.achievement_id: ua.earned_at
        for ua in db.query(UserAchievement).filter(UserAchievement.patient_id == patient_id).all()
    }
    result = []
    for a in all_achievements:
        result.append({
            "id": a.id,
            "code": a.code,
            "title": a.title,
            "emoji": a.emoji,
            "description": a.description,
            "next_milestone_hint": a.next_milestone_hint,
            "earned_at": earned.get(a.id),
        })
    return result


def get_achievement_detail(db: Session, patient_id: uuid.UUID, achievement_id: uuid.UUID) -> dict | None:
    a = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not a:
        return None
    ua = (
        db.query(UserAchievement)
        .filter(UserAchievement.patient_id == patient_id, UserAchievement.achievement_id == achievement_id)
        .first()
    )
    return {
        "id": a.id,
        "code": a.code,
        "title": a.title,
        "emoji": a.emoji,
        "description": a.description,
        "next_milestone_hint": a.next_milestone_hint,
        "earned_at": ua.earned_at if ua else None,
    }


def _award_if_not_earned(db: Session, patient_id: uuid.UUID, code: str) -> None:
    achievement = db.query(Achievement).filter(Achievement.code == code).first()
    if not achievement:
        return
    already = (
        db.query(UserAchievement)
        .filter(UserAchievement.patient_id == patient_id, UserAchievement.achievement_id == achievement.id)
        .first()
    )
    if not already:
        db.add(UserAchievement(patient_id=patient_id, achievement_id=achievement.id))
        db.commit()


def check_and_award_streak_achievements(db: Session, patient_id: uuid.UUID) -> None:
    """Call this after any daily task completion to see if a streak badge should unlock.
    Reuses the same care-plan streak logic as the Care Plan screen."""
    from app.crud.care_plan import get_active_plan, calculate_streak  # local import avoids circularity

    plan = get_active_plan(db, patient_id)
    if not plan:
        return
    streak = calculate_streak(db, plan)
    if streak >= 7:
        _award_if_not_earned(db, patient_id, "streak_7_day")
    if streak >= 14:
        _award_if_not_earned(db, patient_id, "streak_14_day")
