# main.py
import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SERVER_ID = os.getenv("SERVER_ID", "server1")
REDIS_URL = os.getenv("REDIS_URL", None)
SUPABASE_URL = os.getenv("SUPABASE_URL", None)
SUPABASE_KEY = os.getenv("SUPABASE_KEY", None)

app = FastAPI()

# --- Supabase ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# --- ConnectionManager ---
class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, room: str):
        await ws.accept()
        self.rooms.setdefault(room, []).append(ws)

    def disconnect(self, ws: WebSocket, room: str):
        self.rooms[room].remove(ws)

    async def broadcast_local(self, message: str, room: str):
        for ws in self.rooms.get(room, []):
            await ws.send_text(message)

manager = ConnectionManager()
redis = None

async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.psubscribe("room:*")
    async for message in pubsub.listen():
        if message["type"] == "pmessage":
            room = message["channel"].decode().split(":", 1)[1]
            data = message["data"].decode()
            await manager.broadcast_local(data, room)

# --- Startup / Shutdown ---
@app.on_event("startup")
async def startup():
    global redis
    if REDIS_URL:
        import redis.asyncio as aioredis
        redis = await aioredis.from_url(REDIS_URL)
        asyncio.create_task(redis_listener())
        print(f"[{SERVER_ID}] Redis conectado")
    else:
        print(f"[{SERVER_ID}] Redis não configurado — modo local apenas")

    if supabase:
        print(f"[{SERVER_ID}] Supabase conectado")
    else:
        print(f"[{SERVER_ID}] Supabase não configurado — histórico desativado")

@app.on_event("shutdown")
async def shutdown():
    if redis:
        await redis.close()

# --- Rotas ---
@app.websocket("/ws/{room}")
async def websocket_endpoint(ws: WebSocket, room: str):
    await manager.connect(ws, room)
    try:
        while True:
            data = await ws.receive_text()
            message = f"[{SERVER_ID}][{room}] {data}"

            if supabase:
                supabase.table("mensagem").insert({
                    "room": room,
                    "content": data,
                    "server_id": SERVER_ID
                }).execute()

            if redis:
                await redis.publish(f"room:{room}", message)
            else:
                await manager.broadcast_local(message, room)

    except WebSocketDisconnect:
        manager.disconnect(ws, room)

@app.get("/history/{room}")
async def get_history(room: str):
    if not supabase:
        return {"error": "Supabase não configurado"}
    result = supabase.table("mensagem").select("*").eq("room", room).order("id", desc=True).limit(50).execute()
    return result.data