import uuid
from datetime import date, datetime
from pydantic import BaseModel
from app.models.meal_log import MealType


class FoodItemOut(BaseModel):
    id: uuid.UUID
    name: str
    emoji: str | None
    cuisine_tag: str | None
    carbs_g: float
    kcal: float | None

    class Config:
        from_attributes = True


class MealLogItemIn(BaseModel):
    """A food item being added to the meal, either picked from the catalog (food_item_id)
    or entered freeform (name + carbs_g)."""
    food_item_id: uuid.UUID | None = None
    name: str
    emoji: str | None = None
    carbs_g: float
    kcal: float | None = None


class MealLogCreate(BaseModel):
    """'Save Meal' on the Log Dinner/Breakfast/etc. screen."""
    meal_type: MealType
    log_date: date
    items: list[MealLogItemIn]


class MealLogItemOut(BaseModel):
    id: uuid.UUID
    name: str
    emoji: str | None
    carbs_g: float
    kcal: float | None

    class Config:
        from_attributes = True


class MealLogOut(BaseModel):
    id: uuid.UUID
    meal_type: MealType
    log_date: date
    logged_at: datetime
    items: list[MealLogItemOut]
    total_carbs_g: float
    total_kcal: float

    class Config:
        from_attributes = True


class MealPlanEntryOut(BaseModel):
    day_of_week: int
    meal_type: str
    food_name: str
    emoji: str | None
    carbs_g: float

    class Config:
        from_attributes = True


class MealPlanDayOut(BaseModel):
    """One tab's worth of entries for the '7-Day Meal Plan' screen."""
    day_label: str        # "Mon", "Tue", ...
    date: date
    entries: list[MealPlanEntryOut]


class MealPlanOut(BaseModel):
    id: uuid.UUID
    week_start_date: date
    days: list[MealPlanDayOut]


class FoodItemDetailOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    image_emoji: str | None
    cuisine_tag: str | None
    carbs_g: float
    kcal: float | None
    prep_time_minutes: int | None
    ingredients: list[str]

    class Config:
        from_attributes = True
