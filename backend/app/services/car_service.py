import httpx
from app.core.config import settings

async def get_cars(city):
    url = "https://car-rental-api.p.rapidapi.com/search"
    headers = {"X-RapidAPI-Key": settings.RAPIDAPI_KEY}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        return res.json()
