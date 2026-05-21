# main.py
import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
import databases
import sqlalchemy

load_dotenv()

SERVER_ID = os.getenv("SERVER_ID", "server1")
REDIS_URL = os.getenv("REDIS_URL", None)
DATABASE_URL = os.getenv("DATABASE_URL", None)

app = FastAPI()

# --- Banco de dados ---
database = databases.Database(DATABASE_URL) if DATABASE_URL else None

metadata = sqlalchemy.MetaData()
messages_table = sqlalchemy.Table(
    "messages",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("room", sqlalchemy.String),
    sqlalchemy.Column("content", sqlalchemy.String),
    sqlalchemy.Column("server_id", sqlalchemy.String),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=sqlalchemy.func.now()),
)

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
        import aioredis
        redis = await aioredis.from_url(REDIS_URL)
        asyncio.create_task(redis_listener())
        print(f"[{SERVER_ID}] Redis conectado")
    else:
        print(f"[{SERVER_ID}] Redis não configurado — modo local apenas")

    if database:
        await database.connect()
        print(f"[{SERVER_ID}] Banco conectado")
    else:
        print(f"[{SERVER_ID}] Banco não configurado — histórico desativado")

@app.on_event("shutdown")
async def shutdown():
    if redis:
        await redis.close()
    if database:
        await database.disconnect()

# --- Rotas ---
@app.websocket("/ws/{room}")
async def websocket_endpoint(ws: WebSocket, room: str):
    await manager.connect(ws, room)
    try:
        while True:
            data = await ws.receive_text()
            message = f"[{SERVER_ID}][{room}] {data}"

            if database:
                await database.execute(
                    messages_table.insert().values(
                        room=room,
                        content=data,
                        server_id=SERVER_ID
                    )
                )

            if redis:
                await redis.publish(f"room:{room}", message)
            else:
                await manager.broadcast_local(message, room)

    except WebSocketDisconnect:
        manager.disconnect(ws, room)

@app.get("/history/{room}")
async def get_history(room: str):
    if not database:
        return {"error": "Banco não configurado"}
    rows = await database.fetch_all(
        messages_table.select()
        .where(messages_table.c.room == room)
        .order_by(messages_table.c.id.desc())
        .limit(50)
    )
    return [dict(row) for row in rows]