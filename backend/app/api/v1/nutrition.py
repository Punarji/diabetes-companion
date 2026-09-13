from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.nutrition import NutritionSummaryOut
from app.crud.nutrition import get_nutrition_summary

router = APIRouter(prefix="/api/v1/nutrition", tags=["nutrition"])


@router.get("/summary", response_model=NutritionSummaryOut)
def nutrition_summary(
    for_date: date = date.today(),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Powers the Nutrition screen."""
    return get_nutrition_summary(db, current_user.id, for_date)
