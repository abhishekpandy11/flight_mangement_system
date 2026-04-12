from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, flights, bookings, hotels, cars, chat

app = FastAPI(title="Flight Management System API")

import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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