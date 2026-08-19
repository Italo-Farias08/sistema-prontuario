# Sistema de Prontuário

Projeto dividido em duas pastas independentes:

```
sistema-prontuario/
├── frontend/   → app React Native / Expo (o mesmo de antes, package.json intacto)
└── backend/    → API Node.js (Express) + PostgreSQL, pronta pro Railway
```

## backend/

```
backend/
├── banco/
│   ├── esquema.sql          # CREATE TABLE de tudo (pacientes, usuarios, medicacoes, checkins)
│   └── dados_exemplo.sql    # os mesmos pacientes que estavam no dadosMock.js
├── scripts/
│   └── migrar.js            # aplica o esquema.sql (e opcionalmente os exemplos) no banco
├── src/
│   ├── configuracao/        # conexão com o banco e variáveis de ambiente
│   ├── middlewares/         # autenticação (JWT) e tratamento de erros
│   ├── rotas/                # define os caminhos /api/...
│   ├── controladores/       # recebe a requisição HTTP, chama o serviço, devolve JSON
│   ├── servicos/             # regra de negócio + consultas SQL
│   ├── utilitarios/          # senha (bcrypt), token (jwt), formatação de paciente
│   ├── app.js                # monta o Express
│   └── servidor.js           # sobe o servidor
├── .env.exemplo
├── package.json
└── railway.json
```

### Rodando localmente

```bash
cd backend
cp .env.exemplo .env      # edite DATABASE_URL com seu Postgres local
npm install
npm run migrar -- --com-exemplos   # cria as tabelas + dados de exemplo
npm run dev
```

A API sobe em `http://localhost:3000/api`.

### Endpoints

| Método | Caminho                        | Quem pode           | Descrição                              |
|--------|---------------------------------|----------------------|------------------------------------------|
| POST   | `/api/autenticacao/entrar`     | público               | login (admin ou cliente), devolve `token` |
| GET    | `/api/pacientes`                | admin                 | lista todos os pacientes                 |
| POST   | `/api/pacientes`                | admin                 | cadastra um novo paciente                |
| GET    | `/api/pacientes/:id`            | admin ou o próprio    | busca um paciente                        |
| PUT    | `/api/pacientes/:id`            | admin                 | atualiza o prontuário                    |
| POST   | `/api/pacientes/:id/checkins`   | admin ou o próprio    | registra check-in de humor/sono/energia  |

Login de exemplo (após rodar `--com-exemplos`):
- **Admin:** perfil `admin`, identificador `admin@clinica.com`, senha `123456`
- **Cliente:** perfil `cliente`, identificador `marina.alves@email.com` (ou o CPF `123.456.789-00`), senha `123456`

### Deploy no Railway

1. Crie um novo projeto no Railway e adicione um serviço **PostgreSQL** (isso já gera a variável `DATABASE_URL` automaticamente).
2. Adicione um segundo serviço apontando para a pasta `backend/` deste repositório (Railway detecta o Node.js via Nixpacks sozinho, o `railway.json` já define o `startCommand`).
3. Em **Variables** do serviço do backend, confirme/adicione:
   - `DATABASE_URL` → normalmente já vem referenciada automaticamente do serviço Postgres
   - `JWT_SECRET` → um valor aleatório forte
   - `NODE_ENV` → `production`
   - `CORS_ORIGIN` → `*` (ou o domínio do app, se aplicável)
4. Depois do primeiro deploy, rode a migração uma vez (pelo Railway CLI, `railway run npm run migrar -- --com-exemplos`, ou conectando no Postgres e colando o conteúdo de `banco/esquema.sql`).
5. Copie a URL pública gerada pelo Railway (algo como `https://seu-servico.up.railway.app`).

## frontend/

Nada mudou na estrutura nem no `package.json`. Só dois pontos passaram a falar com o backend de verdade em vez do mock:

- `src/configuracao/api.js` → troque `URL_BASE_API` pela URL do Railway + `/api`.
- `src/servicos/dadosServico.js` → agora usa `fetch` para chamar a API (mesmas funções de antes: `autenticar`, `listarClientes`, `buscarClientePorId`, `criarCliente`, `atualizarCliente`, e a nova `registrarCheckin`).

Rodando normalmente:

```bash
cd frontend
npm install
npx expo start
```
