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
        if v is None: return v
        return html.unescape(re.sub(r'<[^>]*>', '', v))

class UserProfileResponse(BaseModel):
    id: int
    username: str | None
    email: str | None
    nombre: str | None
    foto_perfil: str | None
    biografia: str | None
    seguidores_privados: bool
    ofertas_publicadas: list = []

    class Config:
        from_attributes = True