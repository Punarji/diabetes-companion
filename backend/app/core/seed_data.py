"""Static seed data for food items and achievements. Load with app/core/seed.py."""

FOOD_ITEMS_SEED = [
    {"name": "Pol Sambol", "emoji": "🌶️", "cuisine_tag": "Sri Lankan", "default_meal_type": "dinner", "carbs_g": 6, "kcal": 90},
    {"name": "Red Rice 1 cup", "emoji": "🍚", "cuisine_tag": "Sri Lankan", "default_meal_type": "dinner", "carbs_g": 45, "kcal": 216},
    {"name": "Parippu Curry", "emoji": "🍛", "cuisine_tag": "Sri Lankan", "default_meal_type": "dinner", "carbs_g": 28, "kcal": 180},
    {"name": "Mallum", "emoji": "🥬", "cuisine_tag": "Sri Lankan", "default_meal_type": "dinner", "carbs_g": 4, "kcal": 45},
    {"name": "String Hoppers (5)", "emoji": "🍜", "cuisine_tag": "Sri Lankan", "default_meal_type": "breakfast", "carbs_g": 38, "kcal": 170},
    {"name": "Kiribath", "emoji": "🍚", "cuisine_tag": "Sri Lankan", "default_meal_type": "breakfast", "carbs_g": 32, "kcal": 200},
    {"name": "Oatmeal with Berries", "emoji": "🥣", "cuisine_tag": None, "default_meal_type": "breakfast", "carbs_g": 45, "kcal": 250},
    {"name": "Grilled Chicken Salad", "emoji": "🥗", "cuisine_tag": None, "default_meal_type": "lunch", "carbs_g": 32, "kcal": 320},
    {"name": "Whole Wheat Pasta", "emoji": "🍝", "cuisine_tag": None, "default_meal_type": "dinner", "carbs_g": 58, "kcal": 380},
    {"name": "Apple & Almond Butter", "emoji": "🍎", "cuisine_tag": None, "default_meal_type": "snack", "carbs_g": 22, "kcal": 190},
]

ACHIEVEMENTS_SEED = [
    {
        "code": "streak_7_day",
        "title": "7-Day Streak",
        "emoji": "🏆",
        "description": "You completed activities for 7 consecutive days without missing a single day. This shows incredible dedication and consistency in your journey.",
        "next_milestone_hint": "Stay consistent with your daily activities. The next milestone is a 14-day streak — keep going!",
    },
    {
        "code": "streak_14_day",
        "title": "14-Day Streak",
        "emoji": "🔥",
        "description": "Two weeks straight! You're building a habit that sticks.",
        "next_milestone_hint": "Keep it up — a 30-day streak is next.",
    },
    {
        "code": "first_glucose_log",
        "title": "First Glucose Log",
        "emoji": "🩸",
        "description": "You logged your very first glucose reading. Every journey starts with a single step.",
        "next_milestone_hint": "Log consistently to unlock the 7-Day Streak badge.",
    },
    {
        "code": "activity_goal_met",
        "title": "Weekly Goal Crusher",
        "emoji": "🏃",
        "description": "You hit your 150 min/week moderate activity goal.",
        "next_milestone_hint": "Do it again next week to earn a 4-week streak badge.",
    },
]
