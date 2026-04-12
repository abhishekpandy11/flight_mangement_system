import httpx
from app.core.config import settings

async def get_hotels(city):
    url = "https://booking-com.p.rapidapi.com/v1/hotels/search"
    headers = {"X-RapidAPI-Key": settings.RAPIDAPI_KEY}
    params = {"dest_type": "city", "dest_id": city}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, params=params)
        return res.json()

async def format_hotels(api_data):
    hotels = []
    for h in api_data.get("result", []):
        hotels.append({
            "name": h.get("hotel_name"),
            "price": h.get("min_total_price"),
            "rating": h.get("review_score"),
            "city": h.get("city")
        })
    return hotels