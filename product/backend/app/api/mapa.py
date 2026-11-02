from fastapi import APIRouter
from typing import List
from app.mapa.schemas import SedeMapaResponse
from app.mapa.services import MapaService

router = APIRouter()

@router.get("/mapa/ofertas", response_model=List[SedeMapaResponse])
def obtener_ofertas_mapa():
    return MapaService.obtener_ofertas_mapa()
