import uuid
import enum
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Enum, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class MealType(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class FoodItem(Base):
    """Static/seeded food catalog — powers food search on the Log Meal screen."""
    __tablename__ = "food_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)          # "Pol Sambol"
    emoji = Column(String, nullable=True)           # "🌶️"
    cuisine_tag = Column(String, nullable=True)      # "Sri Lankan"
    default_meal_type = Column(Enum(MealType), nullable=True)
    carbs_g = Column(Float, nullable=False)
    kcal = Column(Float, nullable=True)


class MealLog(Base):
    """One meal entry (e.g. 'Dinner' on a given date) with multiple food items."""
    __tablename__ = "meal_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    meal_type = Column(Enum(MealType), nullable=False)
    log_date = Column(Date, nullable=False)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("MealLogItem", back_populates="meal_log", cascade="all, delete-orphan")

    @property
    def total_carbs_g(self) -> float:
        return sum(item.carbs_g for item in self.items)

    @property
    def total_kcal(self) -> float:
        return sum(item.kcal or 0 for item in self.items)


class MealLogItem(Base):
    """A single food item within a logged meal — snapshotted at log time
    (carbs/kcal copied in, so later edits to FoodItem don't retroactively change history)."""
    __tablename__ = "meal_log_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meal_log_id = Column(UUID(as_uuid=True), ForeignKey("meal_logs.id"), nullable=False)
    food_item_id = Column(UUID(as_uuid=True), ForeignKey("food_items.id"), nullable=True)

    name = Column(String, nullable=False)
    emoji = Column(String, nullable=True)
    carbs_g = Column(Float, nullable=False)
    kcal = Column(Float, nullable=True)

    meal_log = relationship("MealLog", back_populates="items")


# --- Fields for the Recipe Detail screen ---
from sqlalchemy import Column as _Column, String as _String, Integer as _Integer, JSON as _JSON
FoodItem.description = _Column(_String, nullable=True)
FoodItem.image_emoji = _Column(_String, nullable=True)
FoodItem.prep_time_minutes = _Column(_Integer, nullable=True)
FoodItem.ingredients = _Column(_JSON, nullable=False, default=list)
