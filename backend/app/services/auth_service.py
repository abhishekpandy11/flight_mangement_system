from sqlalchemy.future import select
from app.models.user import User
from app.core.security import hash_password, verify_password, create_token
from fastapi import HTTPException

async def signup(db, email, password):
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(email=email, password=hash_password(password))
    db.add(user)
    await db.commit()
    return user

async def login(db, email, password):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar()

    if not user or not verify_password(password, user.password):
        return None

    token = create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}