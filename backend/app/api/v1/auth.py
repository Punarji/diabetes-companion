from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token, create_refresh_token, create_access_token as create_reset_token,
)
from app.schemas.user import UserCreate, UserOut, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.token import Token
from app.crud.user import get_user_by_email, create_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """'Create Account' screen — full name, email, password, date of birth, and role
    (patient/physician) selected on the 'Who are you?' screen."""
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user_in)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """'Welcome Back' Sign In screen. form_data.username carries the email."""
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access = create_access_token(user.email, {"role": user.role.value})
    refresh = create_refresh_token(user.email)
    return Token(access_token=access, refresh_token=refresh)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """'Reset your password' screen — always returns 202 regardless of whether the
    email exists, so the endpoint can't be used to enumerate registered accounts."""
    user = get_user_by_email(db, payload.email)
    if user:
        reset_token = create_reset_token(user.email, {"type": "password_reset"})
        # TODO: send reset_token via an email provider (e.g. SES/SendGrid) once configured
    return {"message": "If that email exists, a reset link has been sent."}
