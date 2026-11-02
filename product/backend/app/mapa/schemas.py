from pydantic import BaseModel, Field
from typing import List

class OfertaMapaItem(BaseModel):
    producto: str
    precio: float
    vigencia: str

class SedeMapaResponse(BaseModel):
    cadena: str
    nombre: str
    latitud: float
    longitud: float
    ofertas: List[OfertaMapaItem] = Field(default_factory=list)
