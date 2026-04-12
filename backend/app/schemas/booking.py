from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingCreate(BaseModel):
    type: str
    airline_logo: Optional[str] = None
    reference_id: str
    description: str
    seats: int = 1

class BookingResponse(BaseModel):
    id: int
    user_id: int
    type: str
    airline_logo: Optional[str] = None
    reference_id: str
    description: str
    seats: int
    status: str
    date_booked: datetime

    class Config:
        orm_mode = True
