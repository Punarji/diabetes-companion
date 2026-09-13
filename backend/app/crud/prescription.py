import uuid
from datetime import date, time
from sqlalchemy.orm import Session
from app.models.medication import Medication
from app.models.patient_profile import PatientProfile
from app.models.appointment import Appointment
from app.models.care_plan import CarePlan, CarePlanTask, TimeOfDay, CarePlanTaskType
from app.models.user import User
from app.schemas.prescription import PrescriptionSubmit


def _create_medications(db: Session, patient_id: uuid.UUID, physician_id: uuid.UUID, meds) -> int:
    count = 0
    for med in meds:
        db.add(Medication(
            patient_id=patient_id,
            prescribed_by_id=physician_id,
            name=med.name,
            dosage=med.dosage,
            frequency_label=med.frequency_label,
            instructions=med.instructions,
            dose_times=["08:00", "20:00"] if "BD" in med.frequency_label.upper() else ["08:00"],
        ))
        count += 1
    return count


def _update_patient_targets(db: Session, patient_id: uuid.UUID, payload: PrescriptionSubmit) -> None:
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
    if not profile:
        return
    profile.daily_carb_limit_g = payload.dietary.carbs_per_day_g
    profile.daily_calorie_limit = payload.dietary.calories
    profile.dietary_restrictions = payload.dietary.restrictions
    profile.fasting_glucose_target = payload.glucose_targets.fasting
    profile.post_meal_glucose_target = payload.glucose_targets.post_meal
    profile.hba1c_target = payload.glucose_targets.hba1c
    profile.exercise_minutes_per_week_target = payload.exercise.minutes_per_week
    profile.recommended_exercise_types = payload.exercise.recommended_types


def _create_follow_up(db: Session, patient_id: uuid.UUID, physician_id: uuid.UUID, follow_up_date: date) -> Appointment:
    physician_user = db.query(User).filter(User.id == physician_id).first()
    appt = Appointment(
        patient_id=patient_id,
        physician_id=physician_id,
        physician_display_name=physician_user.full_name if physician_user else "Doctor",
        scheduled_at=datetime_combine_midday(follow_up_date),
        note="Follow-up appointment",
    )
    db.add(appt)
    return appt


def datetime_combine_midday(d: date):
    from datetime import datetime, time as dtime
    return datetime.combine(d, dtime(hour=10, minute=0))


def _generate_care_plan(db: Session, patient_id: uuid.UUID, physician_id: uuid.UUID, payload: PrescriptionSubmit) -> CarePlan:
    plan = CarePlan(
        patient_id=patient_id,
        prescribed_by_id=physician_id,
        start_date=date.today(),
        duration_weeks=12,
        is_active=True,
    )
    db.add(plan)
    db.flush()  # get plan.id

    db.add(CarePlanTask(
        care_plan_id=plan.id,
        task_type=CarePlanTaskType.GLUCOSE,
        time_of_day=TimeOfDay.MORNING,
        scheduled_time=time(hour=7, minute=0),
        title="Fasting Blood Glucose",
        detail=f"Target < {payload.glucose_targets.fasting} mg/dL",
    ))
    for med in payload.medications:
        db.add(CarePlanTask(
            care_plan_id=plan.id,
            task_type=CarePlanTaskType.MEDICATION,
            time_of_day=TimeOfDay.MORNING,
            scheduled_time=time(hour=8, minute=0),
            title=f"{med.name} {med.dosage}",
            detail=med.instructions,
        ))
    db.add(CarePlanTask(
        care_plan_id=plan.id,
        task_type=CarePlanTaskType.ACTIVITY,
        time_of_day=TimeOfDay.AFTERNOON,
        scheduled_time=time(hour=17, minute=0),
        title="Exercise",
        detail=f"{payload.exercise.minutes_per_week} min/week — {', '.join(payload.exercise.recommended_types)}",
    ))

    return plan


def submit_prescription(db: Session, patient_id: uuid.UUID, physician_id: uuid.UUID, payload: PrescriptionSubmit):
    med_count = _create_medications(db, patient_id, physician_id, payload.medications)
    _update_patient_targets(db, patient_id, payload)
    appointment = _create_follow_up(db, patient_id, physician_id, payload.follow_up_date)

    care_plan_created = False
    if payload.generate_care_plan:
        _generate_care_plan(db, patient_id, physician_id, payload)
        care_plan_created = True

    db.commit()

    return {
        "medications_created": med_count,
        "care_plan_created": care_plan_created,
        "follow_up_appointment_id": str(appointment.id),
    }
