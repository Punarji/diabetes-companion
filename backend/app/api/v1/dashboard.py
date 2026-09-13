from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.dashboard import DashboardOut
from app.crud.dashboard import get_dashboard

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def home_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Single call that powers the entire Home tab."""
    return get_dashboard(db, current_user)
