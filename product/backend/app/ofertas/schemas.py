from pydantic import BaseModel, Field, field_validator, ConfigDict
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
        if isinstance(v, str):
            s = v.strip()
            if s.endswith('Z'):
                s = s[:-1] + '+00:00'
            try:
                dt = datetime.fromisoformat(s)
                return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
            except ValueError:
                raise ValueError("Formato de fecha inválido")
        raise ValueError("Formato de fecha inválido")

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
    autor_foto: str | None = None
    promedio_calificacion: float = 0.0
    total_calificaciones: int = 0
    mi_calificacion: int | None = None

    model_config = ConfigDict(from_attributes=True)

class CalificacionResponse(BaseModel):
    promedio: float
    promedio_calificacion: float
    total_calificaciones: int
    mi_calificacion: int