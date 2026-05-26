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
https://console.upstash.com/redis/8a7b960a-bd0d-4d9e-b69b-c9e8ed624e1c?teamid=0
https://supabase.com/dashboard/project/vbhinrljrnwvmccdizrk

3. REDIS

Link: https://console.upstash.com/redis/727b6cc3-c3e4-4cf6-ab22-f3ab301122d4/details?teamid=0







