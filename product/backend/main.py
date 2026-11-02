from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.db.session import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Club Discounts API")

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
