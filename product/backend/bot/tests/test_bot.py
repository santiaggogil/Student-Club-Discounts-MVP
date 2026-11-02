"""Pruebas del bot SIN red: los fixtures son muestras sintéticas del formato de cada fuente.
La verificación contra los sitios reales se hace con `python -m bot_ofertas verificar`."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from bot_ofertas import (ClienteHTTP, ClienteTelegram, ConfigFuente, FuenteError, HtmlAdapter, Oferta,  # noqa: E402
                         RepositorioOfertas, TelegramError, VtexAdapter, cargar_fuentes, enlace_vinculacion,
                         formatear_publicacion, generar_codigo_vinculacion, notificar, procesar_vinculaciones, recolectar)
from bot_ofertas.fuentes import _num  # noqa: E402

FIX = Path(__file__).parent / "fixtures"


def transporte_fake(respuestas):
    llamadas = []

    def t(url, headers, timeout):
        llamadas.append((url, headers))
        for patron, resp in respuestas.items():
            if patron in url:
                return resp
        return 404, ""
    t.llamadas = llamadas
    return t


def cliente(respuestas):
    return ClienteHTTP(transporte=transporte_fake(respuestas), espera_s=0, dormir=lambda s: None)


def test_parseo_vtex_normaliza_y_detecta_descuentos():
    cfg = ConfigFuente(id="exito", tienda="Éxito", tipo="vtex", url_base="https://www.exito.com", consultas=["arroz"])
    ofertas = VtexAdapter(cfg).parsear(json.loads((FIX / "vtex_busqueda.json").read_text(encoding="utf-8")), "arroz")
    assert [o.producto for o in ofertas] == ["Arroz Diana 1000 g", "Leche entera 1 L", "Atún en agua 160 g"]
    arroz, leche, atun = ofertas
    assert arroz.descuento_pct == 16.0 and arroz.es_oferta and arroz.categoria == "Arroz"
    assert not leche.es_oferta and leche.url == "https://www.exito.com/leche-entera/p"
    assert atun.disponible is False


def test_html_con_selectores():
    cfg = ConfigFuente(id="d1", tienda="D1", tipo="html", url_base="https://d1.ejemplo", paginas=["/promos"],
                       selectores={"item": ".promo", "nombre": ".nombre", "precio": ".ahora", "precio_anterior": ".antes",
                                   "enlace": "a.link", "imagen": "img.foto"})
    ofertas = HtmlAdapter(cfg).parsear((FIX / "promos.html").read_text(encoding="utf-8"), "https://d1.ejemplo/promos")
    assert len(ofertas) == 2
    assert ofertas[0].precio_actual == 14900 and ofertas[0].precio_anterior == 18500
    assert ofertas[0].url == "https://d1.ejemplo/p/huevos" and ofertas[0].imagen == "https://d1.ejemplo/img/huevos.png"


def test_html_sin_selectores_falla_explicitamente():
    with pytest.raises(FuenteError, match="selectores"):
        HtmlAdapter(ConfigFuente(id="x", tienda="X", tipo="html", url_base="https://x"))


@pytest.mark.parametrize("texto,valor", [("$ 14.900", 14900), ("12.900,50", 12900.5), ("4200", 4200), ("$1,250", 1250), ("", None)])
def test_numeros_formato_colombiano(texto, valor):
    assert _num(texto) == valor


def test_robots_txt_bloquea():
    c = cliente({"/robots.txt": (200, "User-agent: *\nDisallow: /api/"), "/api/": (200, "[]")})
    with pytest.raises(FuenteError, match="robots.txt"):
        c.get_json("https://tienda.ejemplo/api/catalog_system/pub/products/search?ft=arroz")


def test_errores_http_y_formato():
    c = cliente({"/robots.txt": (404, ""), "bloqueado": (403, "no"), "lento": (429, ""), "html": (200, "<html>")})
    for path, msg in (("bloqueado", "403"), ("lento", "429"), ("html", "no es JSON")):
        with pytest.raises(FuenteError, match=msg):
            c.get_json(f"https://t.ejemplo/{path}")


def test_recoleccion_aislando_fallos_y_vigencia(tmp_path):
    vtex = (FIX / "vtex_busqueda.json").read_text(encoding="utf-8")
    fuentes = [ConfigFuente(id="exito", tienda="Éxito", tipo="vtex", url_base="https://www.exito.com", consultas=["arroz"]),
               ConfigFuente(id="caida", tienda="Caída", tipo="vtex", url_base="https://caida.ejemplo", consultas=["arroz"]),
               ConfigFuente(id="off", tienda="Off", tipo="html", url_base="https://off", activo=False)]
    c = cliente({"robots.txt": (404, ""), "www.exito.com/api": (200, vtex), "caida.ejemplo/api": (503, "")})
    repo = RepositorioOfertas(tmp_path / "bot.db")
    res = {r.fuente: r for r in recolectar(repo, c, fuentes)}
    assert res["exito"].estado == "ok" and res["exito"].ofertas == 2 and len(res["exito"].nuevas) == 2
    assert res["caida"].estado == "error" and "503" in res["caida"].error
    assert res["off"].estado == "omitida"
    assert [o["producto"] for o in repo.ofertas_vigentes()] == ["Atún en agua 160 g", "Arroz Diana 1000 g"]
    # Segunda pasada: el arroz ya no está en oferta → deja de estar vigente; nada nuevo
    sin_arroz = json.loads(vtex)
    sin_arroz[0]["items"][0]["sellers"][0]["commertialOffer"]["ListPrice"] = 4200
    c2 = cliente({"robots.txt": (404, ""), "www.exito.com/api": (200, json.dumps(sin_arroz))})
    res2 = recolectar(repo, c2, fuentes, solo="exito")[0]
    assert res2.nuevas == [] and [o["producto"] for o in repo.ofertas_vigentes()] == ["Atún en agua 160 g"]
    assert repo.ejecuciones()[0]["estado"] == "ok"


def test_configuracion_real_es_valida():
    fuentes = cargar_fuentes()
    assert {f.id for f in fuentes} >= {"exito", "olimpica", "jumbo"}
    assert all(f.url_base.startswith("https://") for f in fuentes)


# ------------------------------------------------------------------ Telegram


def tg_fake(respuestas):
    enviados = []

    def t(url, payload, timeout):
        metodo = url.rsplit("/", 1)[-1]
        enviados.append((metodo, payload))
        r = respuestas[metodo]
        return r(payload) if callable(r) else r
    t.enviados = enviados
    return t


def test_telegram_sin_token(monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    with pytest.raises(TelegramError, match="BotFather"):
        ClienteTelegram()


def test_notificacion_selectiva_y_bloqueos():
    def send(payload):
        if payload["chat_id"] == 2:
            return 403, {"ok": False, "error_code": 403, "description": "Forbidden: bot was blocked by the user"}
        if payload["chat_id"] == 3:
            return 400, {"ok": False, "error_code": 400, "description": "Bad Request: chat not found"}
        return 200, {"ok": True, "result": {"message_id": 1}}
    t = tg_fake({"sendMessage": send})
    c = ClienteTelegram(token="t", transporte=t, dormir=lambda s: None)
    texto = formatear_publicacion("Ana", "Corrientazo a $9.000", "Incluye jugo", "Cra 23 frente a la U")
    res = notificar(c, [1, 2, 3, 1], texto)
    assert res.enviados == [1] and res.bloqueados == [2] and res.fallidos[0][0] == 3
    assert sum(1 for m, _ in t.enviados if m == "sendMessage") == 3  # sin duplicados
    assert "Nueva oferta de Ana" in t.enviados[0][1]["text"]


def test_telegram_reintenta_429():
    estado = {"n": 0}

    def send(payload):
        estado["n"] += 1
        if estado["n"] == 1:
            return 429, {"ok": False, "error_code": 429, "description": "Too Many Requests", "parameters": {"retry_after": 3}}
        return 200, {"ok": True, "result": {}}
    esperas = []
    c = ClienteTelegram(token="t", transporte=tg_fake({"sendMessage": send}), dormir=esperas.append)
    c.enviar_mensaje(10, "hola")
    assert esperas == [3]


def test_vinculacion_por_start():
    codigo = generar_codigo_vinculacion()
    assert len(codigo) == 16 and enlace_vinculacion("@MiBot", codigo).endswith(f"MiBot?start={codigo}")
    updates = {"ok": True, "result": [
        {"update_id": 7, "message": {"text": f"/start {codigo}", "chat": {"id": 555}, "from": {"username": "ana"}}},
        {"update_id": 8, "message": {"text": "hola", "chat": {"id": 556}}}]}
    c = ClienteTelegram(token="t", transporte=tg_fake({"getUpdates": (200, updates)}), dormir=lambda s: None)
    vinculos, siguiente = procesar_vinculaciones(c, None)
    assert [(v.codigo, v.chat_id) for v in vinculos] == [(codigo, 555)] and siguiente == 9


def test_oferta_valida_datos():
    assert Oferta("x", "X", "", 0, None, "ftp://a").validar() == ["producto vacío", "precio_actual no positivo", "url inválida"]
