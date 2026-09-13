import uuid
from datetime import date
from sqlalchemy.orm import Session
from app.models.meal_log import MealLog, MealType
from app.models.patient_profile import PatientProfile

MEAL_ICONS = {
    MealType.BREAKFAST: "🥣",
    MealType.LUNCH: "🍚",
    MealType.DINNER: "🍽️",
    MealType.SNACK: "🍎",
}

# Rough estimate only — MealLogItem tracks carbs_g/kcal, not full macros.
# Approximates protein/fat/fiber from total calories using typical ratios.
PROTEIN_KCAL_RATIO = 0.20
FAT_KCAL_RATIO = 0.30
FIBER_PER_100_KCAL = 1.4


def get_nutrition_summary(db: Session, patient_id: uuid.UUID, log_date: date | None = None):
    from app.schemas.nutrition import MacroBreakdown, MealSummaryItem, NutritionSummaryOut

    log_date = log_date or date.today()

    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
    carb_limit = (profile.daily_carb_limit_g if profile and profile.daily_carb_limit_g else 180.0)
    calorie_limit = (profile.daily_calorie_limit if profile and profile.daily_calorie_limit else 2000.0)

    meal_logs = (
        db.query(MealLog)
        .filter(MealLog.patient_id == patient_id, MealLog.log_date == log_date)
        .all()
    )
    logs_by_type = {m.meal_type: m for m in meal_logs}

    total_carbs = sum(m.total_carbs_g for m in meal_logs)
    total_kcal = sum(m.total_kcal for m in meal_logs)

    protein_g = round((total_kcal * PROTEIN_KCAL_RATIO) / 4, 1)
    fat_g = round((total_kcal * FAT_KCAL_RATIO) / 9, 1)
    fiber_g = round((total_kcal / 100) * FIBER_PER_100_KCAL, 1)

    meals = []
    for meal_type in [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER]:
        log = logs_by_type.get(meal_type)
        if log and log.items:
            label = " + ".join(item.name for item in log.items)
            meals.append(MealSummaryItem(
                meal_type=meal_type, icon=MEAL_ICONS[meal_type],
                label=label, carbs_g=log.total_carbs_g, logged=True,
            ))
        else:
            meals.append(MealSummaryItem(
                meal_type=meal_type, icon=MEAL_ICONS[meal_type],
                label="Not logged yet", carbs_g=None, logged=False,
            ))

    return NutritionSummaryOut(
        log_date=log_date,
        daily_carb_limit_g=carb_limit,
        carbs_consumed_g=round(total_carbs, 1),
        carbs_remaining_g=round(max(carb_limit - total_carbs, 0), 1),
        calories_consumed=round(total_kcal, 1),
        daily_calorie_limit=calorie_limit,
        macros=MacroBreakdown(protein_g=protein_g, fat_g=fat_g, fiber_g=fiber_g),
        meals=meals,
    )
