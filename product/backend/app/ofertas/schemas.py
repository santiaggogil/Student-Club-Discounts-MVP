from pydantic import BaseModel, Field
from datetime import datetime

class OfertaCreate(BaseModel):
    titulo: str = Field(..., min_length=1, description="Título obligatorio")
    precio: float = Field(..., gt=0, description="Precio obligatorio mayor a 0")
    ubicacion: str = Field(..., min_length=1, description="Ubicación obligatoria")
    vigencia: datetime = Field(..., description="Fecha y hora de vigencia")
    descripcion: str = Field(..., min_length=1, description="Descripción breve obligatoria")

class OfertaResponse(BaseModel):
    id: int
    titulo: str
    precio: float
    ubicacion: str
    vigencia: datetime
    descripcion: str
    imagen: str | None
    autor_id: int

    class Config:
        from_attributes = True
