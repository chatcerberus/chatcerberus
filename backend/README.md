# ChatCerberus

> Sistema distribuído de comunicação em tempo real — construído por estudantes, rodando na nuvem, resistente a falhas.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![React](https://img.shields.io/badge/react-18+-61DAFB)

---

## 📌 Sobre o Projeto

O **ChatCerberus** é um mini sistema de mensagens distribuído desenvolvido como trabalho acadêmico para a disciplina de **Programação Distribuída**. 

O sistema demonstra na prática os principais conceitos de sistemas distribuídos:

- **Tolerância a falhas** — se um servidor cair, o chat continua funcionando
- **Transparência de localização** — o cliente não sabe em qual servidor está conectado
- **Consistência** — todas as mensagens passam por um barramento central (Redis)
- **Escalabilidade horizontal** — basta subir novas instâncias do backend
- **Concorrência** — múltiplos usuários simultâneos via WebSocket

---

## 🏗️ Arquitetura

```
          ┌─────────────────────────────────────┐
          │             CLIENTES                │
          │   Browser A          Browser B      │
          └────────┬─────────────────┬──────────┘
                   │ WebSocket       │ WebSocket
          ┌────────▼─────────────────▼──────────┐
          │           BACKEND (2 instâncias)    │
          │                                     │
          │  ┌────────────┐  ┌────────────┐     │
          │  │ Servidor A │  │ Servidor B │     │
          │  │ (Render 1) │  │ (Render 2) │     │
          │  │  FastAPI   │  │  FastAPI   │     │
          │  └─────┬──────┘  └──────┬─────┘     │
          └────────┼────────────────┼────────────┘
                   └───────┬────────┘
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌──────────────────┐   ┌─────────────────────────┐
   │  Redis (Upstash) │   │  PostgreSQL (Supabase)  │
   │  Pub/Sub         │   │  Histórico de mensagens │
   └──────────────────┘   └─────────────────────────┘
```

### Fluxo de uma mensagem

1. Usuário digita no Browser A → Servidor A recebe via WebSocket
2. Servidor A salva no PostgreSQL (persistência)
3. Servidor A publica no canal Redis `sala:geral`
4. **Todos** os servidores ouvem o Redis e entregam para seus clientes conectados

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Python + FastAPI | 3.10+ / 0.104+ |
| WebSocket | Uvicorn + websockets | 0.24+ / 12.0+ |
| Mensageria | Redis Pub/Sub (Upstash) | 5.0+ |
| Banco de dados | PostgreSQL (Supabase) | - |
| Frontend | React + Vite | 18+ / 4+ |
| Deploy Backend | Render | - |
| Deploy Frontend | Vercel | - |

---

## 👥 Equipe

| Papel | Responsabilidades |
|-------|------------------|
| 👨‍💻 Pessoa 1: Aline Matoso de Lima — Backend | Python, FastAPI, WebSocket, Redis Pub/Sub, PostgreSQL |
| 🎨 Pessoa 2: Pedro Henrique dos Santos da Silva — Frontend | React, WebSocket client, fallback automático, UI |
| ☁️ Pessoa 3: Helena Bury Santos — DevOps | Infraestrutura, deploy, testes de falha, documentação |

---

## 📁 Estrutura do Repositório

```
chatcerberus/
├── backend/
│   ├── main.py              # Servidor FastAPI + WebSocket
│   ├── database.py          # Conexão com PostgreSQL
│   ├── redis_client.py      # Conexão com Redis
│   ├── websocket_manager.py # Gerenciamento de conexões
│   ├── models.py            # Estruturas de dados (Pydantic)
│   └── requirements.txt     # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── StatusBar.jsx
│   │   └── hooks/
│   │       └── useWebSocket.js
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── architecture.md      # Diagramas e explicações
│   ├── deploy.md            # Guia de deploy
│   └── tests.md             # Como testar falhas
├── scripts/
│   ├── setup_local.sh       # Setup do ambiente local
│   └── test_failure.sh      # Simula queda de servidor
├── .env.example             # Variáveis de ambiente (template)
└── README.md
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Python 3.10+
- Node.js 18+
- Git

### Backend

```bash
# Entrar na pasta do backend
cd backend

# Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp ../.env.example .env
# Editar .env com suas credenciais

# Rodar o servidor
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

### Rodar 2 servidores localmente (para testar distribuição)

```bash
# Terminal 1 — Servidor A
SERVER_ID=server-a uvicorn main:app --port 8000

# Terminal 2 — Servidor B
SERVER_ID=server-b uvicorn main:app --port 8001
```

---

## ☁️ Deploy

Os serviços estão hospedados gratuitamente:

| Serviço | URL | Plataforma |
|---------|-----|-----------|
| Backend A | `https://chatcerberus-a.onrender.com` | Render |
| Backend B | `https://chatcerberus-b.onrender.com` | Render |
| Frontend | `https://chatcerberus.vercel.app` | Vercel |
| Redis | Upstash (São Paulo) | Upstash |
| PostgreSQL | Supabase (São Paulo) | Supabase |

> Consulte [docs/deploy.md](docs/deploy.md) para o guia completo de deploy.

---

## 🧪 Testando a Tolerância a Falhas

```bash
# Verificar se todos os servidores estão no ar
./scripts/health_check.sh

# Simular queda do Servidor A
./scripts/test_failure.sh
```

Para o teste manual:
1. Abra dois navegadores conectados ao chat
2. Envie mensagens — funcionando normalmente
3. Derrube o Servidor A no painel do Render (Suspend)
4. Observe o frontend reconectar automaticamente no Servidor B
5. Continue enviando mensagens — o chat não interrompeu

> Consulte [docs/tests.md](docs/tests.md) para o guia completo de testes.

---

## 🌿 Branches

```
main              ← produção (estável)
dev               ← integração
backend/pessoa1   ← desenvolvimento backend
frontend/pessoa2  ← desenvolvimento frontend
devops/pessoa3    ← infraestrutura e documentação
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📚 Disciplina

Trabalho desenvolvido para a disciplina de **Programação Distribuída**  
Curso de Ciência da Computação — 5º Período
# chatcerberus
Sistema distribuído de comunicação em tempo real

### comandos
Rodar a main - teste: uvicorn main:app --reload - unico servidor

Para interagir entre servidores, roda assim em diferentes terminais
Terminal 1 - SERVER_ID=server1 uvicorn main:app --port 8001
Terminal 2 - SERVER_ID=server2 uvicorn main:app --port 8002

### Acessos

1. RENDER - para o deploy

Servidor A: 
https://dashboard.render.com/web/srv-d874f38jo6nc738bcrg0/deploys/dep-d874f3gjo6nc738bcsb0?r=2026-05-20%4023%3A44%3A18%7E2026-05-20%4023%3A46%3A22

Servidor B:
https://cerberus-backend-b.onrender.com

2. SUPABASE
# https://console.upstash.com/redis/8a7b960a-bd0d-4d9e-b69b-c9e8ed624e1c?teamid=0
https://supabase.com/dashboard/project/vbhinrljrnwvmccdizrk

3. REDIS

Link: https://console.upstash.com/redis/727b6cc3-c3e4-4cf6-ab22-f3ab301122d4/details?teamid=0







