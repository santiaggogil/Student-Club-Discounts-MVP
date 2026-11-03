from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

class OfertaCreate(BaseModel):
    titulo: str = Field(..., min_length=1)
    precio: float = Field(..., gt=0)
    ubicacion: str = Field(..., min_length=1)
    vigencia: datetime
    descripcion: str = Field(..., min_length=1)

    @field_validator('vigencia', mode='before')
    @classmethod
    def parse_vigencia(cls, v):
        if isinstance(v, datetime): return v
        dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
        return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

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
    mi_calificacion: int | None = None

    class Config:
        from_attributes = True