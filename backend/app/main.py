from fastapi import FastAPI
from app.core.config import settings
from app import models  # noqa: F401  (registers all SQLAlchemy models)
from app.api.v1 import (
    auth, users, patient_profile, risk_assessment, medications, care_plan, dashboard,
    meals, activity, achievements, glucose, reminder, my_doctor, notification, nutrition, progress, physician,
)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(patient_profile.router)
app.include_router(risk_assessment.router)
app.include_router(medications.router)
app.include_router(care_plan.router)
app.include_router(dashboard.router)
app.include_router(meals.router)
app.include_router(activity.router)
app.include_router(achievements.router)
app.include_router(glucose.router)
app.include_router(reminder.router)
app.include_router(my_doctor.router)
app.include_router(notification.router)
app.include_router(nutrition.router)
app.include_router(progress.router)
app.include_router(physician.router)


@app.get("/")
def root():
    return {"status": "ok", "service": settings.PROJECT_NAME}
