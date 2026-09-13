from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.progress import ProgressSummaryOut
from app.crud.progress import get_progress_summary

router = APIRouter(prefix="/api/v1/progress", tags=["progress"])


@router.get("", response_model=ProgressSummaryOut)
def progress_summary(
    period: str = "week",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Powers the My Progress screen."""
    return get_progress_summary(db, current_user.id, period)
