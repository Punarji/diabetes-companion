import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Achievement(Base):
    """Static catalog of possible achievements/badges."""
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)   # "streak_7_day"
    title = Column(String, nullable=False)                 # "7-Day Streak"
    emoji = Column(String, nullable=False, default="🏆")
    description = Column(String, nullable=False)
    next_milestone_hint = Column(String, nullable=True)     # "The next milestone is a 14-day streak..."


class UserAchievement(Base):
    """An achievement a specific patient has earned, with the date earned."""
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False)

    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    achievement = relationship("Achievement")
