from app.services.hotel_service import get_hotels
from app.services.car_service import get_cars

async def get_recommendations(destination):
    hotels = await get_hotels(destination)
    cars = await get_cars(destination)

    return {
        "hotels": hotels,
        "cars": cars
    }