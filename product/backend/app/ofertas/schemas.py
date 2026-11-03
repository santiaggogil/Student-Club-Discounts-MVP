from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

class OfertaCreate(BaseModel):
    titulo: str = Field(..., min_length=1, description="Título obligatorio")
    precio: float = Field(..., gt=0, description="Precio obligatorio mayor a 0")
    ubicacion: str = Field(..., min_length=1, description="Ubicación obligatoria")
    vigencia: datetime = Field(..., description="Fecha y hora de vigencia")
    descripcion: str = Field(..., min_length=1, description="Descripción breve obligatoria")

    @field_validator('vigencia', mode='before')
    @classmethod
    def parse_vigencia(cls, v):
        if isinstance(v, datetime):
            dt = v
        elif isinstance(v, str):
            s = v.strip()
            if s.endswith('Z'):
                s = s[:-1] + '+00:00'
            try:
                dt = datetime.fromisoformat(s)
            except ValueError:
                raise ValueError("Formato de fecha de vigencia inválido")
        else:
            raise ValueError("Formato de fecha de vigencia inválido")
        
        if dt.tzinfo is None:
            bogota_tz = ZoneInfo("America/Bogota")
            dt = dt.replace(tzinfo=bogota_tz)
        
        return dt.astimezone(timezone.utc)

    @field_validator('vigencia')
    @classmethod
    def validate_vigencia(cls, v):
        now = datetime.now(timezone.utc)
        if v < now:
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
