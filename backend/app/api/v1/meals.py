import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.meal import FoodItemOut, MealLogCreate, MealLogOut, MealPlanOut, FoodItemDetailOut
from app.crud.meal import (
    search_food_items, create_meal_log, get_meals_for_date, get_active_meal_plan, build_meal_plan_response,
    get_food_item_detail,
)

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])


@router.get("/food-search", response_model=list[FoodItemOut])
def food_search(
    q: str | None = None,
    tag: str | None = None,          # e.g. "Sri Lankan"
    meal_type: str | None = None,     # breakfast/lunch/dinner/snack
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Powers the search bar + Recent/Breakfast/Sri Lankan/AI Suggest tabs on Log Meal."""
    return search_food_items(db, q, tag, meal_type)


@router.post("", response_model=MealLogOut, status_code=201)
def log_meal(payload: MealLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """'Save Meal' button."""
    return create_meal_log(db, current_user.id, payload)


@router.get("/today", response_model=list[MealLogOut])
def todays_meals(
    for_date: date = date.today(),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_meals_for_date(db, current_user.id, for_date)


@router.get("/plan", response_model=MealPlanOut)
def get_meal_plan(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the '7-Day Meal Plan' screen with its Mon-Sun tabs."""
    plan = get_active_meal_plan(db, current_user.id)
    if not plan:
        return MealPlanOut(id=None, week_start_date=date.today(), days=[])
    return MealPlanOut(id=plan.id, week_start_date=plan.week_start_date, days=build_meal_plan_response(plan))


@router.get("/food-items/{food_item_id}", response_model=FoodItemDetailOut)
def food_item_detail(
    food_item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Powers the Recipe Detail screen (e.g. 'Parippu Curry')."""
    item = get_food_item_detail(db, food_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return FoodItemDetailOut(
        id=item.id,
        name=item.name,
        description=item.description,
        image_emoji=item.image_emoji or item.emoji,
        cuisine_tag=item.cuisine_tag,
        carbs_g=item.carbs_g,
        kcal=item.kcal,
        prep_time_minutes=item.prep_time_minutes,
        ingredients=item.ingredients or [],
    )
