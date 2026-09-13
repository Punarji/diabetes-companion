from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.glucose import GlucoseReadingCreate, GlucoseReadingOut
from app.crud.glucose import create_reading, get_readings_for_date, get_recent_readings, evaluate_reading

router = APIRouter(prefix="/api/v1/glucose", tags=["glucose"])


def _to_out(reading) -> GlucoseReadingOut:
    return GlucoseReadingOut(
        id=reading.id,
        reading_type=reading.reading_type,
        value_mg_dl=reading.value_mg_dl,
        meal_reference=reading.meal_reference,
        notes=reading.notes,
        recorded_at=reading.recorded_at,
        feedback=evaluate_reading(reading.reading_type, reading.value_mg_dl),
    )


@router.post("", response_model=GlucoseReadingOut, status_code=201)
def log_glucose(
    payload: GlucoseReadingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """'Save Reading' button on the Log Glucose screen."""
    reading = create_reading(db, current_user.id, payload)
    return _to_out(reading)


@router.get("/preview", response_model=dict)
def preview_feedback(reading_type: str, value_mg_dl: float):
    """Optional: live feedback preview as the user types, before saving."""
    from app.models.glucose_reading import GlucoseReadingType
    feedback = evaluate_reading(GlucoseReadingType(reading_type), value_mg_dl)
    return feedback.model_dump()


@router.get("/today", response_model=list[GlucoseReadingOut])
def todays_readings(
    for_date: date = date.today(),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    readings = get_readings_for_date(db, current_user.id, for_date)
    return [_to_out(r) for r in readings]


@router.get("/recent", response_model=list[GlucoseReadingOut])
def recent_readings(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    readings = get_recent_readings(db, current_user.id, limit)
    return [_to_out(r) for r in readings]


@router.get("/summary", response_model=dict)
def glucose_summary(
    period: str = "7d",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Powers the Glucose dashboard: chart bars, time-in-range %, alert banner, today's readings."""
    from app.crud.glucose import build_summary
    return build_summary(db, current_user.id, period).model_dump()
