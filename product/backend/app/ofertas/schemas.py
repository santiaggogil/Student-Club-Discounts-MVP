from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class OfertaCreate(BaseModel):
    titulo: str = Field(..., min_length=1, description="Título obligatorio")
    precio: float = Field(..., gt=0, description="Precio obligatorio mayor a 0")
    ubicacion: str = Field(..., min_length=1, description="Ubicación obligatoria")
    vigencia: datetime = Field(..., description="Fecha y hora de vigencia")
    descripcion: str = Field(..., min_length=1, description="Descripción breve obligatoria")

    @field_validator('vigencia')
    @classmethod
    def validate_vigencia(cls, v):
        if v < datetime.now():
            raise ValueError("La vigencia no puede ser una fecha pasada")
        return v

class OfertaResponse(BaseModel):
    id: int
    titulo: str
    precio: float
    ubicacion: str
    vigencia: datetime
    descripcion: str
    imagen: str | None
    autor_id: int
    autor_username: str | None = None
    promedio_calificacion: float = 0.0
    total_calificaciones: int = 0
    vigente: bool
    vence_en: str

    class Config:
        from_attributes = True