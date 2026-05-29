import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app

@pytest.fixture
def client():
    with patch("main.aioredis.from_url", new_callable=AsyncMock):
        with TestClient(app) as c:
            yield c

def test_history_sem_supabase(client):
    response = client.get("/history/sala-teste")
    assert response.status_code == 200
    assert response.json() == {"error": "Supabase não configurado"}

def test_rota_inexistente(client):
    response = client.get("/rota-que-nao-existe")
    assert response.status_code == 404