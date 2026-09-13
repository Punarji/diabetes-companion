from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.my_doctor import MyDoctorOut
from app.crud.my_doctor import get_my_doctor_data

router = APIRouter(prefix="/api/v1/my-doctor", tags=["my-doctor"])


@router.get("", response_model=MyDoctorOut)
def my_doctor(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Powers the 'My Doctor' screen."""
    return get_my_doctor_data(db, current_user.id)
