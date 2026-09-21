# SiOfi — instruções para o Claude Code

Visão geral do projeto, stack e pendências: `README.md`.

## Deploy

Deploy no Coolify (`https://painel.daksa.online`), repositório `github.com/casteleti/siofi`, branch `main`.

Após qualquer alteração aprovada pelo usuário e commitada:

1. `git push origin main`
2. `bash deploy.sh` — dispara o webhook de deploy do Coolify (não é necessário se o Auto deploy via webhook do GitHub estiver ativo).

Se o Coolify responder 401, definir `COOLIFY_TOKEN` (token da API, criado no painel) no ambiente. Nunca commitar o token.
