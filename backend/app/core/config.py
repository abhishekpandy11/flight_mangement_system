from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    AVIATIONSTACK_API_KEY: str
    RAPIDAPI_KEY: str

    # Mail configuration
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_FROM_NAME: str
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    GROQ_API_KEY: str


    model_config = {
        "env_file": [".env", "../.env"],
        "extra": "ignore"
    }

settings = Settings()