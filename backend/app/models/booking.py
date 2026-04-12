from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    type = Column(String)  # flight / hotel / car
    airline_logo = Column(String, nullable=True)
    reference_id = Column(String)
    description = Column(String)
    seats = Column(Integer, default=1)
    status = Column(String, default="confirmed")
    date_booked = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")