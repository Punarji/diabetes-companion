"""
Run once after migrations to populate static catalogs.
Usage (from backend/ with venv activated):
    python -m app.core.seed
"""
from app.core.database import SessionLocal
from app.models.meal_log import FoodItem
from app.models.achievement import Achievement
from app.core.seed_data import FOOD_ITEMS_SEED, ACHIEVEMENTS_SEED


def run():
    db = SessionLocal()
    try:
        if db.query(FoodItem).count() == 0:
            for item in FOOD_ITEMS_SEED:
                db.add(FoodItem(**item))
            print(f"Seeded {len(FOOD_ITEMS_SEED)} food items.")
        else:
            print("Food items already seeded, skipping.")

        if db.query(Achievement).count() == 0:
            for item in ACHIEVEMENTS_SEED:
                db.add(Achievement(**item))
            print(f"Seeded {len(ACHIEVEMENTS_SEED)} achievements.")
        else:
            print("Achievements already seeded, skipping.")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
