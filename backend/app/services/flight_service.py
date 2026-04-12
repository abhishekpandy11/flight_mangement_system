import httpx
import random
from app.core.config import settings

BASE_URL = "http://api.aviationstack.com/v1/flights"

# Map of common Indian city names to IATA airport codes
CITY_TO_IATA = {
    "delhi": "DEL",
    "new delhi": "DEL",
    "mumbai": "BOM",
    "bombay": "BOM",
    "bangalore": "BLR",
    "bengaluru": "BLR",
    "chennai": "MAA",
    "madras": "MAA",
    "hyderabad": "HYD",
    "kolkata": "CCU",
    "calcutta": "CCU",
    "ahmedabad": "AMD",
    "pune": "PNQ",
    "goa": "GOI",
    "jaipur": "JAI",
    "kochi": "COK",
    "cochin": "COK",
    "lucknow": "LKO",
    "patna": "PAT",
    "bhubaneswar": "BBI",
    "indore": "IDR",
    "nagpur": "NAG",
    "surat": "STV",
    "chandigarh": "IXC",
    "amritsar": "ATQ",
    "varanasi": "VNS",
    "coimbatore": "CJB",
    "visakhapatnam": "VTZ",
    "vizag": "VTZ",
    "tiruchirappalli": "TRZ",
    "trichy": "TRZ",
    "guwahati": "GAU",
    "ranchi": "IXR",
    "bhopal": "BHO",
    "raipur": "RPR",
    "srinagar": "SXR",
    "jammu": "IXJ",
    "leh": "IXL",
    "agartala": "IXA",
    "imphal": "IMF",
    "port blair": "IXZ",
    "udaipur": "UDR",
    "jodhpur": "JDH",
    "aurangabad": "IXU",
    "mangalore": "IXE",
    "mysore": "MYQ",
    "tirupati": "TIR",
    "madurai": "IXM",
    "hubli": "HBX",
    "dehradun": "DED",
    "bagdogra": "IXB",
    "dibrugarh": "DIB",
    # International cities
    "dubai": "DXB",
    "london": "LHR",
    "new york": "JFK",
    "singapore": "SIN",
    "bangkok": "BKK",
    "paris": "CDG",
    "toronto": "YYZ",
    "sydney": "SYD",
    "kuala lumpur": "KUL",
    "hong kong": "HKG",
    "tokyo": "NRT",
    "frankfurt": "FRA",
    "amsterdam": "AMS",
    "doha": "DOH",
    "abu dhabi": "AUH",
    "moscow": "SVO",
    "beijing": "PEK",
    "chicago": "ORD",
    "los angeles": "LAX",
    "san francisco": "SFO",
    "kathmandu": "KTM",
    "colombo": "CMB",
    "dhaka": "DAC",
    "karachi": "KHI",
    "lahore": "LHE",
}

# Indian airlines with IATA codes - used for mock data generation
INDIAN_AIRLINES = [
    {"name": "Air India", "iata": "AI", "logo": "air_india"},
    {"name": "IndiGo", "iata": "6E", "logo": "indigo"},
    {"name": "SpiceJet", "iata": "SG", "logo": "spicejet"},
    {"name": "Vistara", "iata": "UK", "logo": "vistara"},
    {"name": "GoFirst", "iata": "G8", "logo": "goair"},
    {"name": "Air Asia India", "iata": "I5", "logo": "airasia"},
    {"name": "Akasa Air", "iata": "QP", "logo": "akasa"},
    {"name": "Air India Express", "iata": "IX", "logo": "air_india_express"},
    {"name": "Alliance Air", "iata": "9I", "logo": "alliance_air"},
    {"name": "StarAir", "iata": "S5", "logo": "starair"},
]

# IATA codes for known Indian airlines — used to filter API results
INDIAN_AIRLINE_IATA_CODES = {a["iata"] for a in INDIAN_AIRLINES}


def city_to_iata(city: str) -> str | None:
    """Convert city name to IATA code. Returns None if not found."""
    key = city.strip().lower()
    # Direct match
    if key in CITY_TO_IATA:
        return CITY_TO_IATA[key]
    # If already a 3-letter IATA code
    if len(key) == 3 and key.upper().isalpha():
        return key.upper()
    return None


def get_logo_key_for_airline(airline_name: str, airline_iata: str) -> str:
    """Map airline name / iata to a logo key."""
    for a in INDIAN_AIRLINES:
        if a["iata"] == airline_iata:
            return a["logo"]
        if a["name"].lower() in airline_name.lower() or airline_name.lower() in a["name"].lower():
            return a["logo"]
    return "unknown"


def get_date_for_route() -> str:
    """Return today's date string."""
    from datetime import date
    return date.today().isoformat()


def generate_mock_flights(dep_city: str, arr_city: str, dep_iata: str, arr_iata: str) -> list:
    """Generate realistic mock flight data for the given route with Indian airlines only."""
    flights = []
    today = get_date_for_route()

    # Use all 8 core airlines for variety (shuffle for randomness)
    core_airlines = INDIAN_AIRLINES[:8]
    chosen_airlines = random.sample(core_airlines, len(core_airlines))

    base_hour = 5
    for i, airline in enumerate(chosen_airlines):
        dep_hour = (base_hour + i * 2) % 22
        dep_minute = random.choice([0, 10, 25, 40, 50])
        duration_mins = random.randint(60, 180)
        total_dep_mins = dep_hour * 60 + dep_minute
        total_arr_mins = total_dep_mins + duration_mins
        arr_hour = total_arr_mins // 60
        arr_minute = total_arr_mins % 60

        # Clamp to valid hours
        if arr_hour >= 24:
            arr_hour = arr_hour % 24

        flight_number = f"{airline['iata']}{random.randint(100, 999)}"

        flights.append({
            "airline": airline["name"],
            "airline_code": airline["iata"],
            "airline_logo": airline["logo"],
            "flight_number": flight_number,
            "dep_iata": dep_iata,
            "arr_iata": arr_iata,
            "departure_city": dep_city.title(),
            "arrival_city": arr_city.title(),
            "departure": f"{today}T{dep_hour:02d}:{dep_minute:02d}:00+05:30",
            "arrival": f"{today}T{arr_hour:02d}:{arr_minute:02d}:00+05:30",
            "status": random.choice(["scheduled", "scheduled", "scheduled", "active"]),
            "duration": f"{duration_mins // 60}h {duration_mins % 60}m",
            "price": random.randint(2500, 15000),
        })

    return flights


async def search_flights(source: str, destination: str) -> list:
    source_clean = source.strip()
    destination_clean = destination.strip()

    # Resolve IATA codes
    dep_iata = city_to_iata(source_clean)
    arr_iata = city_to_iata(destination_clean)

    flights = []

    # Only call the Aviationstack API if we have IATA codes AND we want to supplement
    # We skip the API entirely for Indian domestic routes and rely on mock data
    # (The API often returns international / irrelevant flights for Indian routes)
    both_indian_airports = dep_iata and arr_iata and (
        dep_iata in CITY_TO_IATA.values() and arr_iata in CITY_TO_IATA.values()
    )

    if not both_indian_airports and dep_iata and arr_iata:
        # International route — try Aviationstack API
        params = {
            "access_key": settings.AVIATIONSTACK_API_KEY,
            "dep_iata": dep_iata,
            "arr_iata": arr_iata,
            "flight_status": "scheduled",
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(BASE_URL, params=params)
                data = res.json()
        except Exception:
            data = {"data": []}

        if "data" in data and isinstance(data["data"], list):
            for f in data["data"]:
                try:
                    api_dep_iata = f.get("departure", {}).get("iata", "").upper()
                    api_arr_iata = f.get("arrival", {}).get("iata", "").upper()

                    # Strict filter — only include flights matching exactly the requested route
                    if api_dep_iata != dep_iata or api_arr_iata != arr_iata:
                        continue

                    airline_name = f.get("airline", {}).get("name", "Unknown Airline")
                    airline_iata = f.get("airline", {}).get("iata", "")

                    logo_key = get_logo_key_for_airline(airline_name, airline_iata)

                    dep_sched = f.get("departure", {}).get("scheduled", "N/A")
                    arr_sched = f.get("arrival", {}).get("scheduled", "N/A")

                    flights.append({
                        "airline": airline_name,
                        "airline_code": airline_iata,
                        "airline_logo": logo_key,
                        "flight_number": f.get("flight", {}).get("iata", "N/A"),
                        "dep_iata": dep_iata,
                        "arr_iata": arr_iata,
                        "departure_city": source_clean.title(),
                        "arrival_city": destination_clean.title(),
                        "departure": dep_sched,
                        "arrival": arr_sched,
                        "status": f.get("flight_status", "scheduled"),
                        "duration": "N/A",
                        "price": random.randint(2500, 15000),
                    })
                except Exception:
                    continue

    # For Indian routes (or when API returns too few results), use mock data
    if len(flights) < 5:
        iata_dep = dep_iata or source_clean[:3].upper()
        iata_arr = arr_iata or destination_clean[:3].upper()
        mock = generate_mock_flights(source_clean, destination_clean, iata_dep, iata_arr)
        # Avoid duplicates by flight number
        existing_fn = {f["flight_number"] for f in flights}
        for m in mock:
            if m["flight_number"] not in existing_fn:
                flights.append(m)

    return flights[:10]