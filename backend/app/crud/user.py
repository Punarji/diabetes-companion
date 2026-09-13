from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
from app.models.patient_profile import PatientProfile
from app.models.physician_profile import PhysicianProfile


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        date_of_birth=user_in.date_of_birth,
        role=user_in.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if db_user.role.value == 'physician':
        db.add(PhysicianProfile(user_id=db_user.id))
    else:
        db.add(PatientProfile(user_id=db_user.id))
    db.commit()

    return db_user


from app.schemas.user import UserProfileUpdate, NotificationChannelsUpdate, ChangePasswordRequest
from app.core.security import verify_password


def update_profile(db: Session, user: User, payload: UserProfileUpdate) -> User:
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def update_notification_channels(db: Session, user: User, payload: NotificationChannelsUpdate) -> User:
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, payload: ChangePasswordRequest) -> tuple[bool, str]:
    if not verify_password(payload.current_password, user.hashed_password):
        return False, "Current password is incorrect"
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return True, "Password updated"
