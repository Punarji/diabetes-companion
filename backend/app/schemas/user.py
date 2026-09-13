import uuid
from datetime import date
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    date_of_birth: date | None = None   # "Create Account" screen
    role: UserRole = UserRole.PATIENT     # from "Who are you?" screen


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    date_of_birth: date | None = None
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class UserProfileOut(BaseModel):
    """Full 'Profile & Settings' + 'Edit Profile' screen data."""
    id: uuid.UUID
    full_name: str
    email: EmailStr
    date_of_birth: date | None
    gender: str | None
    phone_number: str | None
    avatar_url: str | None
    role: UserRole
    push_notifications_enabled: bool
    email_alerts_enabled: bool
    patient_count: int | None = None   # only populated for physicians

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """'Save Changes' on the Edit Profile screen — all fields optional (partial update)."""
    full_name: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    phone_number: str | None = None
    avatar_url: str | None = None


class NotificationChannelsUpdate(BaseModel):
    """Push/Email toggles on the Profile & Settings screen."""
    push_notifications_enabled: bool | None = None
    email_alerts_enabled: bool | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
