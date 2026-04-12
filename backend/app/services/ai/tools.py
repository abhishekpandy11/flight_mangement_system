from langchain_core.tools import tool
import json
from app.services.flight_service import search_flights as search_flights_service
from app.services.booking_service import create_booking as create_booking_service
from app.services.booking_service import cancel_booking as cancel_booking_service
from app.services.booking_service import get_user_bookings as get_user_bookings_service
from app.core.database import SessionLocal
from app.schemas.booking import BookingCreate
from pydantic import BaseModel, Field

class FlightSearchSchema(BaseModel):
    source: str = Field(description="The source city for the flight search")
    destination: str = Field(description="The destination city for the flight search")

class UserIDSchema(BaseModel):
    user_id: int = Field(description="The ID of the user")

class BookingIDSchema(BaseModel):
    booking_id: int = Field(description="The ID of the booking to cancel")

class BookingCreateSchema(BaseModel):
    user_id: int = Field(description="The ID of the user creating the booking")
    type: str = Field(description="The type of booking, e.g., 'flight' or 'hotel'")
    airline_logo: str = Field(description="The logo key for the airline")
    reference_id: str = Field(description="The flight number or a reference ID")
    description: str = Field(description="A brief description of the booking")
    seats: int = Field(description="The number of seats or rooms to book")

class HumanAssistanceSchema(BaseModel):
    reason: str = Field(description="The reason why human assistance is needed")

@tool(args_schema=FlightSearchSchema)
async def search_flights(source: str, destination: str):
    """Search for flights between source and destination cities."""
    flights = await search_flights_service(source, destination)
    return json.dumps(flights)

@tool(args_schema=UserIDSchema)
async def list_my_bookings(user_id: int):
    """List all active bookings for the current user."""
    async with SessionLocal() as db:
        bookings = await get_user_bookings_service(db, user_id)
        # Convert to serializable format
        results = [
            {
                "id": b.id,
                "type": b.type,
                "description": b.description,
                "reference_id": b.reference_id,
                "seats": b.seats,
                "status": b.status,
                "date_booked": b.date_booked.isoformat() if b.date_booked else None
            } for b in bookings
        ]
        return json.dumps(results)

@tool(args_schema=BookingCreateSchema)
async def create_new_booking(user_id: int, type: str, airline_logo: str, reference_id: str, description: str, seats: int):
    """Create a new booking for a flight or hotel."""
    async with SessionLocal() as db:
        payload = BookingCreate(
            type=type,
            airline_logo=airline_logo,
            reference_id=reference_id,
            description=description,
            seats=seats
        )
        booking = await create_booking_service(db, user_id, payload)
        return json.dumps({"id": booking.id, "status": "confirmed", "message": "Booking successful"})

@tool(args_schema=BookingIDSchema)
async def cancel_existing_booking(booking_id: int):
    """Cancel an existing booking by its ID."""
    async with SessionLocal() as db:
        result = await cancel_booking_service(db, booking_id)
        if result:
            return json.dumps({"status": "success", "message": f"Booking {booking_id} cancelled"})
        return json.dumps({"status": "error", "message": "Booking not found"})

@tool(args_schema=HumanAssistanceSchema)
async def request_human_assistance(reason: str):
    """Request help from a human agent when you are stuck, unsure, or the user asks for a human."""
    return json.dumps({"status": "escalated", "reason": reason, "message": "A human agent has been notified and will assist you shortly."})

tools = [search_flights, list_my_bookings, create_new_booking, cancel_existing_booking, request_human_assistance]
