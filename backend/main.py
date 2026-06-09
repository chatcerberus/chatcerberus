# main.py
import asyncio
import os
import logging
import redis.asyncio as aioredis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv

load_dotenv()

SERVER_ID = os.getenv("SERVER_ID", "server1")
REDIS_URL = os.getenv("REDIS_URL", None)
SUPABASE_URL = os.getenv("SUPABASE_URL", None)
SUPABASE_KEY = os.getenv("SUPABASE_KEY", None)

logging.basicConfig(
    level=logging.INFO,
    format=f"[{SERVER_ID}] %(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger(SERVER_ID)

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, room: str):
        await ws.accept()
        self.rooms.setdefault(room, []).append(ws)
        log.info(f"Cliente conectou na sala '{room}' — total na sala: {len(self.rooms[room])}")

    def disconnect(self, ws: WebSocket, room: str):
        self.rooms[room].remove(ws)
        log.info(f"Cliente desconectou da sala '{room}' — total na sala: {len(self.rooms[room])}")

    async def broadcast_local(self, message: str, room: str):
        clientes = self.rooms.get(room, [])
        log.info(f"broadcast_local — sala: '{room}', clientes: {len(clientes)}")
        for ws in clientes:
            await ws.send_text(message)

manager = ConnectionManager()
redis_client = None  # <- renomeado para evitar conflito

async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.psubscribe("room:*")
    log.info("Redis listener iniciado — escutando room:*")
    async for message in pubsub.listen():
        if message["type"] == "pmessage":
            room = message["channel"].decode().split(":", 1)[1]
            payload = message["data"].decode()
            origin_server, data = payload.split("|", 1)
            log.info(f"Redis → mensagem de '{origin_server}' na sala '{room}'")
            if origin_server != SERVER_ID:
                await manager.broadcast_local(data, room)

def get_supabase():
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@app.on_event("startup")
async def startup():
    global redis_client
    if REDIS_URL:
        redis_client = await aioredis.from_url(REDIS_URL)
        asyncio.create_task(redis_listener())
        log.info("Redis conectado")
    else:
        log.info("Redis não configurado — modo local apenas")

    if SUPABASE_URL and SUPABASE_KEY:
        log.info("Supabase configurado")
    else:
        log.info("Supabase não configurado — histórico desativado")

@app.on_event("shutdown")
async def shutdown():
    log.info("Servidor encerrando...")
    if redis_client:
        await redis_client.close()

@app.websocket("/ws/{room}")
async def websocket_endpoint(ws: WebSocket, room: str):
    await manager.connect(ws, room)

    if SUPABASE_URL and SUPABASE_KEY:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, lambda: get_supabase().table("mensagem").select("*").eq("room", room).order("id").limit(50).execute())
        for msg in result.data:
            await ws.send_text(f"[histórico] {msg['server_id']} — {msg['content']}")
        log.info(f"Histórico enviado para novo cliente na sala '{room}' — {len(result.data)} mensagens")

    try:
        while True:
            data = await ws.receive_text()
            log.info(f"Mensagem recebida na sala '{room}': {data}")

            if SUPABASE_URL and SUPABASE_KEY:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, lambda: get_supabase().table("mensagem").insert({
                    "room": room,
                    "content": data,
                    "server_id": SERVER_ID
                }).execute())
                log.info(f"Mensagem salva no Supabase — sala: '{room}'")

            if redis_client:
                await manager.broadcast_local(data, room)
                await redis_client.publish(f"room:{room}", f"{SERVER_ID}|{data}")
                log.info(f"Mensagem publicada no Redis — sala: '{room}'")
            else:
                await manager.broadcast_local(data, room)

    except WebSocketDisconnect:
        manager.disconnect(ws, room)

@app.get("/history/{room}")
async def get_history(room: str):
    log.info(f"Histórico solicitado para sala '{room}'")
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"error": "Supabase não configurado"}
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: get_supabase().table("mensagem").select("*").eq("room", room).order("id", desc=True).limit(50).execute())
    return result.data