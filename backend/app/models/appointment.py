import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class Appointment(Base):
    """Powers the 'Next Appointment' card on the Home dashboard."""
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    physician_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    physician_display_name = Column(String, nullable=False)   # "Dr. Kamal Perera"

    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    note = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
