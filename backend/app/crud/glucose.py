import uuid
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.models.glucose_reading import GlucoseReading, GlucoseReadingType
from app.schemas.glucose import GlucoseReadingCreate, GlucoseFeedback

TARGET_RANGES = {
    GlucoseReadingType.FASTING:   (70, 99, 125),
    GlucoseReadingType.POST_MEAL: (70, 179, 199),
    GlucoseReadingType.BEDTIME:   (70, 140, 160),
    GlucoseReadingType.RANDOM:    (70, 140, 199),
}

LABELS = {
    GlucoseReadingType.FASTING: "fasting",
    GlucoseReadingType.POST_MEAL: "post-meal",
    GlucoseReadingType.BEDTIME: "bedtime",
    GlucoseReadingType.RANDOM: "random",
}


def evaluate_reading(reading_type: GlucoseReadingType, value: float) -> GlucoseFeedback:
    low, normal_max, warning_max = TARGET_RANGES[reading_type]
    type_label = LABELS[reading_type]

    if value < low:
        return GlucoseFeedback(label=f"Low — below {type_label} target", severity="low")
    if value <= normal_max:
        return GlucoseFeedback(label=f"Within {type_label} target", severity="normal")
    if value <= warning_max:
        return GlucoseFeedback(label=f"Slightly above {type_label} target", severity="warning")
    return GlucoseFeedback(label=f"High — above {type_label} target", severity="high")


def create_reading(db: Session, patient_id: uuid.UUID, payload: GlucoseReadingCreate) -> GlucoseReading:
    reading = GlucoseReading(
        patient_id=patient_id,
        reading_type=payload.reading_type,
        value_mg_dl=payload.value_mg_dl,
        meal_reference=payload.meal_reference,
        notes=payload.notes,
    )
    if payload.recorded_at:
        reading.recorded_at = payload.recorded_at
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


def get_readings_for_date(db: Session, patient_id: uuid.UUID, log_date: date) -> list[GlucoseReading]:
    return (
        db.query(GlucoseReading)
        .filter(
            GlucoseReading.patient_id == patient_id,
            GlucoseReading.recorded_at >= datetime.combine(log_date, datetime.min.time()),
            GlucoseReading.recorded_at < datetime.combine(log_date, datetime.max.time()),
        )
        .order_by(GlucoseReading.recorded_at.desc())
        .all()
    )


def get_recent_readings(db: Session, patient_id: uuid.UUID, limit: int = 20) -> list[GlucoseReading]:
    return (
        db.query(GlucoseReading)
        .filter(GlucoseReading.patient_id == patient_id)
        .order_by(GlucoseReading.recorded_at.desc())
        .limit(limit)
        .all()
    )


PERIOD_DAYS = {"7d": 7, "30d": 30, "90d": 90}

MEAL_SLOT_LABELS = ["Fasting", "Post-breakfast", "Post-lunch"]


def _severity_to_day_status(severities: list[str]) -> str:
    if not severities:
        return "no_data"
    if "high" in severities:
        return "very_high"
    if "warning" in severities:
        return "high"
    return "in_range"


def build_summary(db: Session, patient_id: uuid.UUID, period: str):
    from app.schemas.glucose import GlucoseChartDay, GlucoseAlert, TodayReadingItem, GlucoseSummaryOut

    num_days = PERIOD_DAYS.get(period, 7)
    today = date.today()
    start_date = today - timedelta(days=num_days - 1)

    readings = (
        db.query(GlucoseReading)
        .filter(
            GlucoseReading.patient_id == patient_id,
            GlucoseReading.recorded_at >= datetime.combine(start_date, datetime.min.time()),
        )
        .order_by(GlucoseReading.recorded_at)
        .all()
    )

    by_day: dict = {}
    all_severities = []
    for r in readings:
        d = r.recorded_at.date()
        by_day.setdefault(d, []).append(r)
        all_severities.append(evaluate_reading(r.reading_type, r.value_mg_dl).severity)

    chart_days = []
    day_range = [start_date + timedelta(days=i) for i in range(num_days)]
    display_days = day_range[-7:] if num_days > 7 else day_range

    for d in display_days:
        day_readings = by_day.get(d, [])
        if day_readings:
            avg = sum(r.value_mg_dl for r in day_readings) / len(day_readings)
            severities = [evaluate_reading(r.reading_type, r.value_mg_dl).severity for r in day_readings]
            status = _severity_to_day_status(severities)
        else:
            avg, status = None, "no_data"
        chart_days.append(GlucoseChartDay(
            day_label=d.strftime("%a"), date_str=d.isoformat(), average_value=avg, status=status,
        ))

    average_value = sum(r.value_mg_dl for r in readings) / len(readings) if readings else 0
    normal_count = sum(1 for s in all_severities if s == "normal")
    time_in_range_percent = round((normal_count / len(all_severities)) * 100) if all_severities else 0

    alert = None
    for r in reversed(readings):
        fb = evaluate_reading(r.reading_type, r.value_mg_dl)
        if fb.severity == "high":
            alert = GlucoseAlert(
                time_label=r.recorded_at.strftime("%a %I%p"),
                value_mg_dl=r.value_mg_dl,
                message=fb.label[0].upper() + fb.label[1:],
            )
            break

    todays = by_day.get(today, [])
    today_readings = []
    for i, slot_label in enumerate(MEAL_SLOT_LABELS):
        match = todays[i] if i < len(todays) else None
        if match:
            fb = evaluate_reading(match.reading_type, match.value_mg_dl)
            status_label = {"normal": "In Range", "warning": "Borderline", "high": "High", "low": "Low"}[fb.severity]
            today_readings.append(TodayReadingItem(
                label=slot_label,
                time_label=match.recorded_at.strftime("%I:%M %p"),
                value_mg_dl=match.value_mg_dl,
                status_label=status_label,
            ))
        else:
            today_readings.append(TodayReadingItem(
                label=slot_label, time_label=None, value_mg_dl=None, status_label="Pending",
            ))

    return GlucoseSummaryOut(
        period=period,
        average_value=round(average_value, 1),
        time_in_range_percent=time_in_range_percent,
        chart_days=chart_days,
        alert=alert,
        today_readings=today_readings,
    )
