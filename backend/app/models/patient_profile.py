import uuid
import enum
from sqlalchemy import Column, Float, String, ForeignKey, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class DiabetesStatus(str, enum.Enum):
    NOT_DIAGNOSED = "not_diagnosed"
    PREDIABETES = "prediabetes"
    TYPE_2_DM = "type_2_dm"


class ActivityLevel(str, enum.Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"


class FamilyHistory(str, enum.Enum):
    YES_PARENT = "yes_parent"
    YES_SIBLING = "yes_sibling"
    NO = "no"
    UNSURE = "unsure"


class SmokingStatus(str, enum.Enum):
    NON_SMOKER = "non_smoker"
    EX_SMOKER = "ex_smoker"
    CURRENT = "current"


class AlcoholUse(str, enum.Enum):
    NONE = "none"
    OCCASIONALLY = "occasionally"
    REGULARLY = "regularly"


class DietaryHabit(str, enum.Enum):
    VEGETARIAN = "vegetarian"
    NON_VEGETARIAN = "non_vegetarian"
    VEGAN = "vegan"


class PreferredLanguage(str, enum.Enum):
    ENGLISH = "english"
    SINHALA = "sinhala"
    TAMIL = "tamil"


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    # Step 1 - Tell us about yourself
    diabetes_status = Column(Enum(DiabetesStatus), nullable=True, default=DiabetesStatus.NOT_DIAGNOSED)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    physical_activity_level = Column(Enum(ActivityLevel), nullable=True)
    family_history_diabetes = Column(Enum(FamilyHistory), nullable=True)

    # Step 2 - Lifestyle & Preferences
    smoking_status = Column(Enum(SmokingStatus), nullable=True)
    alcohol_use = Column(Enum(AlcoholUse), nullable=True)
    dietary_habit = Column(Enum(DietaryHabit), nullable=True)
    preferred_language = Column(Enum(PreferredLanguage), nullable=True, default=PreferredLanguage.ENGLISH)

    # misc
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    linked_physician_id = Column(UUID(as_uuid=True), ForeignKey("physician_profiles.id"), nullable=True)

    user = relationship("User", back_populates="patient_profile")

    @property
    def bmi(self) -> float | None:
        if self.weight_kg and self.height_cm:
            height_m = self.height_cm / 100
            return round(self.weight_kg / (height_m ** 2), 1)
        return None

    @property
    def bmi_category(self) -> str | None:
        bmi = self.bmi
        if bmi is None:
            return None
        if bmi < 18.5:
            return "Underweight"
        if bmi < 25:
            return "Normal"
        if bmi < 30:
            return "Overweight"
        return "Obese"


# --- Nutrition targets for the Nutrition screen ---
from sqlalchemy import Column as _Column, Float as _Float
PatientProfile.daily_carb_limit_g = _Column(_Float, nullable=True, default=180.0)
PatientProfile.daily_calorie_limit = _Column(_Float, nullable=True, default=2000.0)


# --- Prescription-related targets ---
from sqlalchemy import Column as _Column2, Float as _Float2, JSON as _JSON2
PatientProfile.fasting_glucose_target = _Column2(_Float2, nullable=True)
PatientProfile.post_meal_glucose_target = _Column2(_Float2, nullable=True)
PatientProfile.hba1c_target = _Column2(_Float2, nullable=True, default=7.0)
PatientProfile.dietary_restrictions = _Column2(_JSON2, nullable=False, default=list)
PatientProfile.exercise_minutes_per_week_target = _Column2(_Float2, nullable=True)
PatientProfile.recommended_exercise_types = _Column2(_JSON2, nullable=False, default=list)
