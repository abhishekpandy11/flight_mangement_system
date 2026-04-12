from sqlalchemy.future import select
from app.models.booking import Booking

async def create_booking(db, user_id, booking_data):
    booking = Booking(
        user_id=user_id,
        type=booking_data.type,
        airline_logo=booking_data.airline_logo,
        reference_id=booking_data.reference_id,
        description=booking_data.description,
        seats=booking_data.seats,
        status="confirmed"
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking

async def cancel_booking(db, booking_id):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar()
    if not booking:
        return None
    # Snapshot the id before deletion (object expires after commit)
    cancelled_id = booking.id
    await db.delete(booking)
    await db.commit()
    return {"id": cancelled_id, "status": "cancelled"}

async def get_user_bookings(db, user_id):
    result = await db.execute(select(Booking).where(Booking.user_id == user_id).order_by(Booking.date_booked.desc()))
    return result.scalars().all()