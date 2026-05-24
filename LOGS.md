# ODONTOSYNC — Progress Logs

## 2026-04-24

- **Task:** Inicialização do Projeto.
- **Status:** Concluído.
- **Ações:**
  - Definição de governança (Strict TS, Continuous Flow).
  - Criação do `WORKSPACE.md`.
  - Remodelação do `GEMINI.md` para Governança Ativa.
- **Próximo Passo:** Definição dos Mocks e fluxo de autenticação.

## 2026-04-25

- **Task:** Simplificação para Validação de Ambiente.
- **Status:** Concluído.
- **Ações:**
  - Refatoração do `app/_layout.tsx` para suporte a `index.tsx`.
  - Criação de `app/index.tsx` com exemplo visual minimalista e funcional.
  - Ajuste no `tsconfig.json` para novos caminhos de importação.
- **Próximo Passo:** Prosseguir com a estruturação modular (src/features).

## 2026-05-15

- **Task:** Estruturação do Design System, Rotas de Perfil (RBAC) e Camada de Mocks.
- **Status:** Concluído.
- **Ações:**
  - Criação do roteamento condicional inteligente por perfil via Expo Router: `app/(auth)`, `app/(admin)` e `app/(client)`.
  - Desenvolvimento da biblioteca de componentes visuais premium reutilizáveis em `src/components/ui/` (Avatar, Badge, Button, Card, Input, KPICard).
  - Implementação das telas visuais completas de Login, Cadastro, Agenda do Dia (Admin), Lista de Pacientes, Visualização de Consultas (Cliente) e Configurações de Perfil.
  - Configuração do controle de estado global e persistente com Zustand Stores (`authStore`, `appointmentStore`, `clinicStore`, `notificationStore`).
  - Criação de estrutura robusta de dados mockados em `src/mocks/` para simulação off-line realista (latência, validação de regras de negócios como o vínculo único de telefone).
- **Próximo Passo:** Refatoração arquitetural para produção, blindagem de endpoints e criação do backend real.

## 2026-05-18

- **Task:** Refatoração de Produção, Desacoplamento de Stores (SOLID/KISS) e Blindagem Backend.
- **Status:** Concluído.
- **Ações:**
  - Implementação da Camada de Service dedicada (`AuthService`, `AppointmentService`) desacoplando a lógica de negócio e os mocks das Stores do Zustand, preparando o app para API física com zero refatoração de telas.
  - Correção de bugs nas chamadas de ações obsoletas na tela de Agenda (`app/(admin)/agenda.tsx`).
  - Criação de servidor Backend completo e profissional em Fastify (`backend/src/server.ts`), com suporte nativo a CORS, JWT e integração com Prisma ORM / PostgreSQL.
  - Desenvolvimento dos middlewares de autorização robustos e seguros (`authenticate` e `requireAdmin`) e proteção das rotas administrativas confidenciais.
  - Geração bem-sucedida do Prisma Client no banco de dados Neon DB e validação do build do backend em TypeScript Strict.
- **Próximo Passo:** Configuração da string de conexão do Neon DB no `.env` do backend, execução do `prisma db push` / migração e início da integração da camada Service frontend com os endpoints reais da API.

## 2026-05-18 (Continuação)

- **Task:** Integração Completa Frontend-Backend (Neon DB + Fastify API)
- **Status:** Concluído.
- **Ações:**
  - Criação do utilitário `api.ts` com interceptador de token JWT via `AsyncStorage`.
  - Refatoração dos serviços `AuthService` e `AppointmentService` substituindo as chamadas mockadas por endpoints HTTP reais.
  - Sincronização da store de Zustand (`appointmentStore`) para buscar dados em background no ciclo de autenticação do `RootLayout`.
  - Criação do arquivo `.env` na raiz do frontend com suporte à variável dinâmica `EXPO_PUBLIC_API_URL`.
  - Validação completa dos builds (`tsc` e `npx tsc --noEmit`) em ambos os lados sem qualquer erro de tipos.
- **Próximo Passo:** Testar fluxos ponta a ponta com emulador/dispositivo real e planejar separação do repositório de backend.

## 2026-05-18 (Web Dev & Seeding)

- **Task:** Suporte Completo à Web (Zustand v5 ESM Fix) & Semeadura de Dados Físicos (Neon DB Seed)
- **Status:** Concluído.
- **Ações:**
  - Correção do erro crítico de empacotamento web (`import.meta` em ESM do Zustand v5) injetando um interceptor customizado `resolveRequest` no [metro.config.js](file:///c:/Users/paulo/workspace/projetos/OdontoSync/metro.config.js) para forçar o uso da build CommonJS estável.
  - Criação do script de sementes robusto [seed.ts](file:///c:/Users/paulo/workspace/projetos/OdontoSync/backend/src/seed.ts) no backend, populando a base ativa do Neon DB com especialidades odontológicas, clínica padrão, usuários e consultas (comuns e órfãs).
  - Execução bem-sucedida do script de semeadura na nuvem Neon, preparando o ambiente para testes interativos instantâneos.
- **Próximo Passo:** Executar testes visuais ponta a ponta na Web (Chrome DevTools Mobile Mode) e mapear melhorias de UX a partir do feedback do usuário.

## 2026-05-18 (Correção de Rotas & Compatibilidade Web)

- **Task:** Correção de Rotas `/auth`, Suporte Cross-Platform para `Alert` e Ajuste de Fluxos Web.
- **Status:** Concluído.
- **Ações:**
  - **Correção da Rota de Login:** Ajuste dos caminhos de requisição de login e cadastro no frontend ([authService.ts](file:///c:/Users/paulo/workspace/projetos/OdontoSync/src/services/authService.ts)) de `/login` para `/auth/login` e `/auth/register` respectivamente, eliminando o erro de roteamento `404` do servidor Fastify.
  - **Componente Cross-Platform Alert:** Criação do utilitário [Alert.ts](file:///c:/Users/paulo/workspace/projetos/OdontoSync/src/components/ui/Alert.ts) que intercepta as chamadas de confirmação em ambiente Web usando os diálogos padrão do navegador (`window.confirm`/`window.alert`), eliminando a inatividade de botões modais como o "Sair da Conta" no navegador.
  - **Correção de "No-Show" (Faltas):** Correção da string de ação no botão de marcar falta na Agenda ([agenda.tsx](file:///c:/Users/paulo/workspace/projetos/OdontoSync/app/(admin)/agenda.tsx)) de `'marcar no-show'` para `'marcar falta'`, harmonizando-o com o validador interno e permitindo a alteração correta do status para `ABSENT`.
- **Próximo Passo:** Prosseguir com os testes de usabilidade e aplicar melhorias visuais e estilizações conforme as orientações de UX fornecidas pelo usuário.

## 2026-05-21 (Refinamento de UX & Integração Final de API)

- **Task:** Melhorias Visuais na Agenda e Substituição Definitiva de Mocks pela API Real.
- **Status:** Concluído.
- **Ações:**
  - **Refinamento de UI/UX:** Substituição dos componentes nativos `<Picker>` (que geravam inconsistências visuais na Web) por Dropdowns customizados e animados na tela de Agenda (`agenda.tsx`).
  - **Correção de Máscaras:** Refatoração das funções de máscara de input (Telefone, Data, Hora) utilizando `slice` puro em vez de Regex replace, resolvendo o bug de travamento do backspace.
  - **Integração Real (Backend):** Criação da rota `GET /clinic/services` no Fastify e inclusão dos pacientes de testes frontend (`Ana Paula Santos`, etc.) diretamente no script de seed (`seed.ts`) do banco PostgreSQL.
  - **Integração Real (Frontend):** Criação de `clinicService.ts` e refatoração da `clinicStore.ts` para buscar Configurações, Pacientes e Serviços diretamente do banco de dados na inicialização do app (`_layout.tsx`), eliminando os dados estáticos (`mockServices`, `mockUsers`).
  - **Persistência de Agendamentos:** Conexão do botão "Salvar Agendamento" com a action `bookAppointment`, registrando oficialmente os novos agendamentos via POST na API com vinculação real ao ID UUID do Serviço e Paciente.
- **Próximo Passo:** Avaliar e polir o fluxo e UX dos modais de Contato (WhatsApp) e Perfil de Usuário, além de refinar a responsividade geral e preparar para os testes finais.
