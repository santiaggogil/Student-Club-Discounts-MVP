# Bot de ofertas y Telegram

Componente independiente del MVP de Student Club Discounts. Ver `CONTRATO.md` para la interfaz que usa el producto.

## Probar sin red

```powershell
cd componentes\bot-ofertas
pip install -r requirements.txt pytest
python -m pytest tests -q
```

Las pruebas usan muestras sintéticas del formato de cada fuente y un transporte falso de Telegram.

## Probar en vivo (desde tu PC)

```powershell
python -m bot_ofertas verificar                       # una consulta por tienda activa
python -m bot_ofertas recolectar --exportar ofertas.json
python -m bot_ofertas listar

$env:TELEGRAM_BOT_TOKEN = "token-de-BotFather"
python -m bot_ofertas telegram-verificar
# Abre https://t.me/<tu_bot>?start=prueba123 y pulsa Iniciar, luego:
python -m bot_ofertas telegram-vinculaciones          # muestra el chat_id vinculado
python -m bot_ofertas telegram-probar <chat_id>
```

Si una tienda responde con error o cambia su formato, `verificar` lo informa por fuente; ajusta `fuentes.json` (o desactívala) y marca `verificado_en_vivo: true` cuando funcione.

## Integrarlo al producto

En la plataforma, en el resumen del proyecto, usa «Integrar componente» con `bot-ofertas` y una ruta como `backend/bot`. Arquitectura, Planning y Coding lo recibirán como componente existente con este contrato.
