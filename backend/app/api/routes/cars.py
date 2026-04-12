from fastapi import APIRouter
from app.services.car_service import get_cars

router = APIRouter()

@router.get("/")
async def cars(city: str):
    return await get_cars(city)