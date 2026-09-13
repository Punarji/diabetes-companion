import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.meal_log import MealLog, MealLogItem, FoodItem, MealType
from app.models.meal_plan import MealPlan, MealPlanEntry
from app.schemas.meal import MealLogCreate

DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def search_food_items(db: Session, query: str | None, tag: str | None, meal_type: str | None, limit: int = 20):
    q = db.query(FoodItem)
    if query:
        q = q.filter(FoodItem.name.ilike(f"%{query}%"))
    if tag:
        q = q.filter(FoodItem.cuisine_tag == tag)
    if meal_type:
        q = q.filter(FoodItem.default_meal_type == meal_type)
    return q.limit(limit).all()


def create_meal_log(db: Session, patient_id: uuid.UUID, payload: MealLogCreate) -> MealLog:
    meal = MealLog(patient_id=patient_id, meal_type=payload.meal_type, log_date=payload.log_date)
    db.add(meal)
    db.flush()  # get meal.id before adding items

    for item in payload.items:
        db.add(MealLogItem(
            meal_log_id=meal.id,
            food_item_id=item.food_item_id,
            name=item.name,
            emoji=item.emoji,
            carbs_g=item.carbs_g,
            kcal=item.kcal,
        ))

    db.commit()
    db.refresh(meal)
    return meal


def get_meals_for_date(db: Session, patient_id: uuid.UUID, log_date: date) -> list[MealLog]:
    return (
        db.query(MealLog)
        .filter(MealLog.patient_id == patient_id, MealLog.log_date == log_date)
        .order_by(MealLog.logged_at)
        .all()
    )


def get_active_meal_plan(db: Session, patient_id: uuid.UUID) -> MealPlan | None:
    return (
        db.query(MealPlan)
        .filter(MealPlan.patient_id == patient_id)
        .order_by(MealPlan.week_start_date.desc())
        .first()
    )


def build_meal_plan_response(plan: MealPlan) -> list[dict]:
    days = []
    for i in range(7):
        day_date = plan.week_start_date + timedelta(days=i)
        entries = [e for e in plan.days if e.day_of_week == i]
        days.append({
            "day_label": DAY_LABELS[i],
            "date": day_date,
            "entries": entries,
        })
    return days


def get_food_item_detail(db: Session, food_item_id: uuid.UUID) -> FoodItem | None:
    return db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
