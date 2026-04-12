from fastapi import APIRouter
from app.services.hotel_service import get_hotels, format_hotels

router = APIRouter()

@router.get("/")
async def hotels(city: str):
    data = await get_hotels(city)
    return await format_hotels(data)