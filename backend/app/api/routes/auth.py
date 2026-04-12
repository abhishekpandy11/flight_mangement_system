from fastapi import APIRouter, Depends, HTTPException, status
import asyncio
from app.services.auth_service import signup, login
from app.core.database import SessionLocal
from app.schemas.auth_schemas import UserCreate, UserLogin, Token
from app.utils.email import send_welcome_email

router = APIRouter()

@router.post("/signup")
async def register(user_in: UserCreate):
    async with SessionLocal() as db:
        user = await signup(db, user_in.email, user_in.password)
        await db.refresh(user)
        
        # Send welcome email in background
        asyncio.create_task(send_welcome_email(user.email))
        
        return {"message": "User created successfully", "email": user.email}

@router.post("/login", response_model=Token)
async def login_user(user_in: UserLogin):
    async with SessionLocal() as db:
        token_data = await login(db, user_in.email, user_in.password)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        return token_data