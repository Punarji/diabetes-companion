from fastapi import APIRouter, Depends
from app.schemas.user import UserOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def read_current_user(current_user = Depends(get_current_user)):
    return current_user


from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserProfileOut, UserProfileUpdate, NotificationChannelsUpdate, ChangePasswordRequest
from app.crud.user import update_profile, update_notification_channels, change_password


@router.get("/me/profile", response_model=UserProfileOut)
def get_my_profile(current_user=Depends(get_current_user)):
    """Powers 'Profile & Settings' and 'Edit Profile' screens."""
    return current_user


@router.patch("/me/profile", response_model=UserProfileOut)
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """'Save Changes' on the Edit Profile screen."""
    return update_profile(db, current_user, payload)


@router.patch("/me/notification-channels", response_model=UserProfileOut)
def update_my_notification_channels(
    payload: NotificationChannelsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Push Notifications / Email Alerts toggles on Profile & Settings."""
    return update_notification_channels(db, current_user, payload)


@router.post("/me/change-password")
def change_my_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """'Change Password' on Profile & Settings."""
    success, message = change_password(db, current_user, payload)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}
