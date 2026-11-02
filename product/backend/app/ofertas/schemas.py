from pydantic import BaseModel, Field, field_validator
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
    autor_username: str | None = None

    @field_validator('autor_username', mode='before')
    @classmethod
    def get_username(cls, v, info):
        if v is not None:
            return v
        obj = info.context.get('obj') if info.context else None
        if obj and hasattr(obj, 'autor') and obj.autor:
            return obj.autor.username
        return v

    class Config:
        from_attributes = True
