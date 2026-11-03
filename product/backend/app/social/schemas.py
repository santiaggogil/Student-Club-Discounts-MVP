from pydantic import BaseModel, Field, field_validator
import html
import re

class UserUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=100)
    foto_perfil: str | None = None
    biografia: str | None = Field(None, max_length=500)
    seguidores_privados: bool | None = None

    @field_validator('biografia')
    @classmethod
    def sanitize_biografia(cls, v):
        if v is None:
            return v
        clean = re.sub(r'<[^>]*>', '', v)
        return html.unescape(clean)

class UserProfileResponse(BaseModel):
    id: int
    username: str | None
    email: str | None
    nombre: str | None
    foto_perfil: str | None
    biografia: str | None
    seguidores_privados: bool
    seguidores_count: int
    seguidos_count: int
    ofertas_publicadas: list = []
    seguidores: list | None = None
    seguidos: list | None = None
    lo_sigo: bool = False

    class Config:
        from_attributes = True
