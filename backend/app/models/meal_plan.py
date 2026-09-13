import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.meal_log import MealType


class MealPlan(Base):
    """A 7-day generated/prescribed meal plan — powers the '7-Day Meal Plan' screen."""
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    week_start_date = Column(Date, nullable=False)

    days = relationship("MealPlanEntry", back_populates="plan", cascade="all, delete-orphan")


class MealPlanEntry(Base):
    """One suggested meal for one day of the plan, e.g. 'Wed - Dinner - Whole Wheat Pasta'."""
    __tablename__ = "meal_plan_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("meal_plans.id"), nullable=False)

    day_of_week = Column(Integer, nullable=False)   # 0=Mon ... 6=Sun
    meal_type = Column(String, nullable=False)        # breakfast/lunch/dinner/snack
    food_name = Column(String, nullable=False)         # "Oatmeal with Berries"
    emoji = Column(String, nullable=True)
    carbs_g = Column(Float, nullable=False)

    plan = relationship("MealPlan", back_populates="days")
