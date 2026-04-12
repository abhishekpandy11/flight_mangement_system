from fastapi import APIRouter
from app.services.flight_service import search_flights
from app.services.recommendation_service import get_recommendations

router = APIRouter()

@router.get("/search")
async def flights(source: str, destination: str):
    flights = await search_flights(source, destination)
    recommendations = await get_recommendations(destination)

    return {
        "flights": flights,
        "recommendations": recommendations
    }