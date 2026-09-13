from datetime import date
from pydantic import BaseModel


class PrescriptionMedicationIn(BaseModel):
    name: str
    dosage: str
    frequency_label: str        # "BD" (twice daily), "OD", etc.
    instructions: str | None = None


class PrescriptionDietaryIn(BaseModel):
    carbs_per_day_g: float
    calories: float
    restrictions: list[str] = []       # ["Low Sugar", "Low GI", "No Alcohol"]


class PrescriptionExerciseIn(BaseModel):
    minutes_per_week: float
    recommended_types: list[str] = []    # ["Walking", "Cycling", "Swimming"]


class PrescriptionGlucoseTargetsIn(BaseModel):
    fasting: float
    post_meal: float
    hba1c: float


class PrescriptionSubmit(BaseModel):
    """Full 'New Prescription' form submission."""
    medications: list[PrescriptionMedicationIn]
    dietary: PrescriptionDietaryIn
    exercise: PrescriptionExerciseIn
    glucose_targets: PrescriptionGlucoseTargetsIn
    follow_up_date: date
    generate_care_plan: bool = True


class PrescriptionResultOut(BaseModel):
    medications_created: int
    care_plan_created: bool
    follow_up_appointment_id: str
