from datetime import date
from pydantic import BaseModel
from app.models.meal_log import MealType


class MacroBreakdown(BaseModel):
    protein_g: float
    fat_g: float
    fiber_g: float


class MealSummaryItem(BaseModel):
    meal_type: MealType
    icon: str
    label: str        # "Oatmeal + Boiled Egg" or "Not logged yet"
    carbs_g: float | None
    logged: bool


class NutritionSummaryOut(BaseModel):
    log_date: date
    daily_carb_limit_g: float
    carbs_consumed_g: float
    carbs_remaining_g: float
    calories_consumed: float
    daily_calorie_limit: float
    macros: MacroBreakdown
    meals: list[MealSummaryItem]
