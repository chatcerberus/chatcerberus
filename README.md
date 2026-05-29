# ChatCerberus

> Sistema distribuido de comunicacao em tempo real — construido por estudantes, rodando na nuvem, resistente a falhas.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![React](https://img.shields.io/badge/react-18+-61DAFB)

---

## Sobre o Projeto

O **ChatCerberus** e um mini sistema de mensagens distribuido desenvolvido como trabalho academico para a disciplina de **Programacao Distribuida**.

O sistema demonstra na pratica os principais conceitos de sistemas distribuidos:

- **Tolerancia a falhas** — se um servidor cair, o chat continua funcionando
- **Transparencia de localizacao** — o cliente nao sabe em qual servidor esta conectado
- **Consistencia** — todas as mensagens passam por um barramento central (Redis)
- **Escalabilidade horizontal** — basta subir novas instancias do backend
- **Concorrencia** — multiplos usuarios simultaneos via WebSocket

---

## Arquitetura
+-------------------------------------+
      |             CLIENTES                |
      |   Browser A          Browser B      |
      +--------+------------------+---------+
               | WebSocket        | WebSocket
      +--------v------------------v---------+
      |         BACKEND (2 instancias)      |
      |                                     |
      |  +------------+  +------------+     |
      |  | Servidor A |  | Servidor B |     |
      |  | (Render 1) |  | (Render 2) |     |
      |  |  FastAPI   |  |  FastAPI   |     |
      |  +-----+------+  +------+-----+     |
      +--------+----------------+-----------+
               +---------+------+
          +----+----------+----+
          v                    v
+------------------+   +-------------------------+
|  Redis (Upstash) |   |  PostgreSQL (Supabase)  |
|  Pub/Sub         |   |  Historico de mensagens |
+------------------+   +-------------------------+
### Fluxo de uma mensagem

1. Usuario digita no Browser A → Servidor A recebe via WebSocket
2. Servidor A salva no PostgreSQL (persistencia)
3. Servidor A publica no canal Redis `sala:geral`
4. **Todos** os servidores ouvem o Redis e entregam para seus clientes conectados

---

## Tecnologias

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Backend | Python + FastAPI | 3.10+ / 0.104+ |
| WebSocket | Uvicorn + websockets | 0.24+ / 12.0+ |
| Mensageria | Redis Pub/Sub (Upstash) | 5.0+ |
| Banco de dados | PostgreSQL (Supabase) | - |
| Frontend | React + Vite + TypeScript | 18+ / 5+ |
| Deploy Backend | Render | - |
| Deploy Frontend | Vercel | - |

---

## Equipe

| Papel | Responsabilidades |
|-------|------------------|
| Pessoa 1: Aline Matoso de Lima — Backend | Python, FastAPI, WebSocket, Redis Pub/Sub, PostgreSQL |
| Pessoa 2: Pedro Henrique dos Santos da Silva — Frontend | React, WebSocket client, fallback automatico, UI |
| Pessoa 3: Helena Bury Santos — DevOps | Infraestrutura, deploy, CI/CD, testes, documentacao |

---

## Estrutura do Repositorio
chatcerberus/
├── backend/
│   ├── main.py              # Servidor FastAPI + WebSocket
│   ├── requirements.txt     # Dependencias Python
│   └── test_main.py         # Testes automatizados
├── frontend/
│   └── react-vite-tanstack-ts/  # Projeto React + Vite + TS
├── .github/
│   └── workflows/
│       ├── ci-backend.yml   # CI do backend
│       ├── ci-frontend.yml  # CI do frontend
│       ├── cd-backend.yml   # CD para o Render
│       └── cd-frontend.yml  # CD para o Vercel
├── docs/
├── scripts/
├── .env.example
└── README.md
---

## Como Rodar Localmente

### Pre-requisitos

- Python 3.10+
- Node.js 20+
- Git

### Backend

`ash
cd backend
pip install -r requirements.txt
cp ../.env.example .env
uvicorn main:app --reload --port 8000
`

### Frontend

`ash
cd frontend/react-vite-tanstack-ts
npm install
npm run dev
`

### Rodar 2 servidores localmente

`ash
# Terminal 1 — Servidor A
SERVER_ID=server-a uvicorn main:app --port 8000

# Terminal 2 — Servidor B
SERVER_ID=server-b uvicorn main:app --port 8001
`

---

## Deploy

| Servico | URL | Plataforma |
|---------|-----|-----------|
| Backend A | https://cerberus-backend-a.onrender.com | Render |
| Backend B | https://cerberus-backend-b.onrender.com | Render |
| Frontend | https://chatcerberus.vercel.app | Vercel |
| Redis | Upstash (Sao Paulo) | Upstash |
| PostgreSQL | Supabase (Sao Paulo) | Supabase |

---

## CI/CD

| Workflow | Gatilho | Acao |
|----------|---------|------|
| ci-backend.yml | PR para main ou dev (backend/**) | Instala dependencias + roda testes |
| ci-frontend.yml | PR para main ou dev (frontend/**) | Instala dependencias + build |
| cd-backend.yml | Push na main (backend/**) | Deploy nos servidores A e B no Render |
| cd-frontend.yml | Push na main (frontend/**) | Deploy no Vercel |

---

## Branches
main              <- producao (estavel)
dev               <- integracao
backend/pessoa1   <- desenvolvimento backend
frontend/pessoa2  <- desenvolvimento frontend
devops/pessoa3    <- infraestrutura e documentacao
---

## Licenca

Este projeto esta sob a licenca MIT.

---

## Disciplina

Trabalho desenvolvido para a disciplina de **Programacao Distribuida**
Curso de Ciencia da Computacao — 5o Periodo
