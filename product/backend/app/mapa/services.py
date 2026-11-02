import sys
from pathlib import Path
from typing import List, Dict, Any

bot_path = Path(__file__).resolve().parent.parent.parent / "bot"
if str(bot_path) not in sys.path:
    sys.path.insert(0, str(bot_path))

from bot_ofertas import RepositorioOfertas, cargar_sedes

DB_PATH = bot_path / "ofertas_bot.db"

class MapaService:
    @staticmethod
    def obtener_ofertas_mapa(repo: Any = None, sedes_dict: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if repo is None:
            repo = RepositorioOfertas(DB_PATH)
        if sedes_dict is None:
            sedes_dict = cargar_sedes().get("sedes", {})
        
        try:
            ofertas_vigentes = repo.ofertas_vigentes()
        except Exception:
            ofertas_vigentes = []

        ofertas_por_fuente: Dict[str, List[Dict[str, Any]]] = {}
        for o in ofertas_vigentes:
            fuente = o.get("fuente")
            if not fuente:
                continue
            if fuente not in ofertas_por_fuente:
                ofertas_por_fuente[fuente] = []
            
            precio = float(o.get("precio_actual", 0.0))
            vigencia = str(o.get("ultima_vez") or o.get("vigencia") or "Vigente")
            
            ofertas_por_fuente[fuente].append({
                "producto": o.get("producto", ""),
                "precio": precio,
                "vigencia": vigencia
            })

        resultado: List[Dict[str, Any]] = []
        for fuente_key, lista_sedes in sedes_dict.items():
            if not isinstance(lista_sedes, list):
                continue
            ofertas_cadena = ofertas_por_fuente.get(fuente_key, [])
            for s in lista_sedes:
                if not isinstance(s, dict):
                    continue
                lat = s.get("lat") if s.get("lat") is not None else s.get("latitud")
                lon = s.get("lon") if s.get("lon") is not None else (s.get("longitud") if s.get("longitud") is not None else s.get("lng"))
                
                if lat is None or lon is None:
                    continue
                try:
                    lat_f = float(lat)
                    lon_f = float(lon)
                except (ValueError, TypeError):
                    continue

                if lat_f == 0.0 and lon_f == 0.0:
                    continue
                
                cadena_nombre = s.get("cadena") or s.get("tienda") or fuente_key.capitalize()
                nombre_sede = s.get("nombre") or cadena_nombre
                
                resultado.append({
                    "cadena": cadena_nombre,
                    "nombre": nombre_sede,
                    "latitud": lat_f,
                    "longitud": lon_f,
                    "ofertas": ofertas_cadena
                })
        
        return resultado
