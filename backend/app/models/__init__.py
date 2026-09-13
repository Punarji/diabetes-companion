from app.models.user import User, UserRole
from app.models.patient_profile import (
    PatientProfile, DiabetesStatus, ActivityLevel, FamilyHistory,
    SmokingStatus, AlcoholUse, DietaryHabit, PreferredLanguage,
)
from app.models.physician_profile import PhysicianProfile
from app.models.achievement import Achievement, UserAchievement
from app.models.appointment import Appointment
from app.models.care_plan import CarePlan, CarePlanTask, CarePlanTaskLog, TimeOfDay, CarePlanTaskType
from app.models.exercise_log import ExerciseLog, DailyActivitySummary, ExerciseType, ExerciseIntensity
from app.models.glucose_reading import GlucoseReading, GlucoseReadingType
from app.models.hba1c_result import Hba1cResult
from app.models.meal_log import MealLog, MealLogItem, FoodItem, MealType
from app.models.meal_plan import MealPlan, MealPlanEntry
from app.models.medication import Medication, MedicationLog, MedicationLogStatus
from app.models.notification import Notification, NotificationType
from app.models.notification_preference import NotificationPreference
from app.models.risk_assessment import RiskAssessment, RiskLevel
