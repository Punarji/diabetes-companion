import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.achievement import AchievementOut
from app.crud.achievement import list_achievements_for_user, get_achievement_detail

router = APIRouter(prefix="/api/v1/achievements", tags=["achievements"])


@router.get("", response_model=list[AchievementOut])
def list_achievements(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Full badge list (earned + locked) — could power a grid/profile screen."""
    return list_achievements_for_user(db, current_user.id)


@router.get("/{achievement_id}", response_model=AchievementOut)
def achievement_detail(achievement_id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the single 'Achievement' detail screen (7-Day Streak card)."""
    result = get_achievement_detail(db, current_user.id, achievement_id)
    if not result:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return result
