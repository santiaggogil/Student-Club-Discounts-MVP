from fastapi import FastAPI
from app.api.health import router as health_router

app = FastAPI(title="Student Club Discounts API")

app.include_router(health_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
