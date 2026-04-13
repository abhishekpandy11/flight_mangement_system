from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, flights, bookings, hotels, cars, chat
import os

app = FastAPI(title="Flight Management System API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Build allowed origins list — include all possible Vercel URLs
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://flight-management-system-gzps.vercel.app",
    # Also allow any Vercel preview deployments for this project
    "https://flight-management-system.vercel.app",
]

# Also allow any custom ALLOWED_ORIGINS env var (comma-separated)
extra_origins = os.getenv("ALLOWED_ORIGINS", "")
if extra_origins:
    allowed_origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

# Remove duplicates, empty strings, and trailing slashes
allowed_origins = list(set(o.rstrip("/") for o in allowed_origins if o))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(flights.router, prefix="/flights")
app.include_router(bookings.router, prefix="/bookings")
app.include_router(hotels.router, prefix="/hotels")
app.include_router(cars.router, prefix="/cars")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
async def root():
    return {"message": "Welcome to Flight Management System API"}