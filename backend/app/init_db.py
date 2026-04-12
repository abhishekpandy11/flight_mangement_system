import asyncio
from app.core.database import engine, Base
# Import models here to ensure they are registered with Base.metadata
from app.models.user import User
from app.models.booking import Booking

async def init_db():
    async with engine.begin() as conn:
        print("Creating tables (users, bookings)...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialization complete.")

if __name__ == "__main__":
    asyncio.run(init_db())
