from fastapi import APIRouter, Depends, HTTPException
import asyncio
from sqlalchemy.future import select
from app.services.booking_service import create_booking, cancel_booking
from app.services.booking_service import get_user_bookings
from app.api.deps import get_current_user
from app.core.database import SessionLocal
from app.schemas.booking import BookingCreate
from app.models.user import User
from app.utils.email import send_booking_confirmation_email, send_cancellation_email
from app.models.booking import Booking

router = APIRouter()

@router.get("/")
async def get_bookings(email: str = Depends(get_current_user)):
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return await get_user_bookings(db, user.id)

@router.post("/")
async def book_item(payload: BookingCreate, email: str = Depends(get_current_user)):
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        booking = await create_booking(db, user.id, payload)
        
        # Send booking confirmation email
        booking_details = {
            "type": booking.type,
            "reference_id": booking.reference_id,
            "description": booking.description,
            "seats": booking.seats
        }
        asyncio.create_task(send_booking_confirmation_email(email, booking_details))
        
        return booking

@router.post("/cancel/{booking_id}")
async def cancel(booking_id: int, email: str = Depends(get_current_user)):
    async with SessionLocal() as db:
        # Fetch booking with user email before deletion
        result = await db.execute(
            select(Booking, User.email)
            .join(User, Booking.user_id == User.id)
            .where(Booking.id == booking_id)
        )
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        booking, user_email = row
        
        cancelled_booking = await cancel_booking(db, booking_id)
        if cancelled_booking is None:
            raise HTTPException(status_code=404, detail="Booking not found or already cancelled")
        
        # Send cancellation email asynchronously
        asyncio.create_task(send_cancellation_email(email=user_email, booking_id=booking_id))
        
        return cancelled_booking