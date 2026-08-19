# App do Consultório — Front-end (React Native / Expo)

Protótipo de front-end, sem backend. Todos os dados vivem em memória
(`src/data/mockData.js` + `src/services/api.js`) e são perdidos ao reiniciar
o app — isso é esperado nesta fase.

## Como rodar (Expo Go)

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android) ou pela câmera (iOS).

## Login de demonstração

Não há validação real. Escolha o perfil ("Sou Paciente" / "Sou Médico(a)"),
preencha qualquer texto e toque em "Entrar".

- **Paciente** → cai direto na ficha de resumo (usa o primeiro paciente mock).
- **Médico(a)** → cai na lista de pacientes, com prontuário completo.

## Estrutura

```
App.js
src/
  theme/          cores, tipografia, espaçamento (design system)
  context/         sessão de autenticação (mock)
  data/            dados de demonstração
  services/api.js  TODA a "regra de negócio" de dados passa por aqui —
                    é o único lugar que vai precisar mudar quando o
                    backend estiver pronto (troque o corpo das funções
                    por chamadas fetch/axios reais)
  navigation/      rotas (login → admin ou cliente, conforme perfil)
  components/      botões, inputs, cards, seletor de pills, escala de
                    emojis, barra de porcentagem, avatar
  screens/
    LoginScreen.js
    admin/AdminHomeScreen.js     lista de pacientes
    admin/ClientFormScreen.js    cadastro (dados do paciente + clínicos)
    admin/ClientRecordScreen.js  prontuário completo (abas: Cadastro,
                                  Prontuário, Sintomas, Avaliação de Risco)
    client/ClientSummaryScreen.js ficha de resumo do paciente + check-in
                                   diário por emojis + agendamento via
                                   WhatsApp
```

## Pontos já deixados prontos para o backend

- `src/services/api.js` — troque cada função (login, getClients,
  getClientById, createClient, updateClient) por chamadas HTTP reais.
- `WHATSAPP_DOUTOR` em `src/data/mockData.js` — troque pelo número real do
  médico (formato internacional, só dígitos).
- O check-in por emoji do paciente (`ClientSummaryScreen`) já isola a
  função `registrarCheckin()` — é só trocar o `TODO backend` por um POST.

## Design

- Paleta: `#F0F0F0` (fundo), `#DB8A43` (destaque/âmbar — assumi que
  "DB843" era uma abreviação de `#DB8A43`; ajuste em `src/theme/theme.js`
  se o tom não for esse), `#666666` (texto).
- Tipografia: preparado para **Argue** (títulos) e **Caviar Dreams**
  (corpo). Como não são fontes públicas, o app usa por enquanto famílias
  nativas elegantes (serifada / humanista) como substitutas visuais — veja
  `assets/fontes/LEIAME.md` para plugar as fontes reais depois.
- Estilo geral: discreto e sofisticado — fundo neutro, cards brancos com
  sombra suave, cantos arredondados, uso pontual da cor âmbar como realce.
