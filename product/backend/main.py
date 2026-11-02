import sys
from pathlib import Path

# Asegurar que el directorio raíz y el bot estén en el path
root = Path(__file__).resolve().parent
sys.path.append(str(root))
sys.path.append(str(root / "bot"))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.ofertas import router as ofertas_router
from app.db.session import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Club Discounts API", redirect_slashes=False)

app.mount("/api/v1/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(ofertas_router, prefix="/api/v1/ofertas")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
