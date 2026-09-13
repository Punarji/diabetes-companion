import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class PhysicianProfile(Base):
    __tablename__ = "physician_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    specialization = Column(String, nullable=True)
    license_number = Column(String, unique=True, nullable=True)
    hospital_affiliation = Column(String, nullable=True)

    user = relationship("User", back_populates="physician_profile")
