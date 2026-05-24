# 🗺️ ODONTOSYNC — Workspace Context

Este documento é a nossa "Fonte da Verdade". Ele descreve a arquitetura, as tecnologias e o mapa de navegação do projeto para garantir a continuidade e escalabilidade.

---

## 🚀 1. Identidade do Projeto
- **Objetivo:** Gestão odontológica com notificações inteligentes e dois perfis de uso (Recepcionista/Paciente).
- **Abordagem:** Design First / Frontend First.
- **Framework:** React Native + Expo (SDK 51+).
- **TypeScript:** Strict TS.
- **Governança:** Continuous Flow (Senior-Level Protocol).

---

## 🛠️ 2. Stack Tecnológica
- **Mobile:** React Native, Expo Router v3.
- **Estilização:** NativeWind v5 (Tailwind CSS).
- **Estado/Mocks:** Zustand, Zod.
- **Package Manager:** pnpm.
- **Elo Central:** O número de telefone é o identificador universal do ecossistema.

---

## 📂 3. Estrutura de Pastas (Mapa de Bordo)

O projeto utiliza o **Expo Router** (roteamento baseado em arquivos), onde a estrutura de pastas define as telas do app.

### 📱 Pasta `/app` (Roteamento)
- **`_layout.tsx`**: Raiz global. Configura temas, fontes e o Stack inicial de navegação.
- **`(tabs)/`**: Grupo de navegação (Group Route). Organiza telas com layouts compartilhados (Ex: Dashboard).
- **`(tabs)/_layout.tsx`**: Configura a navegação interna do grupo.
- **`(tabs)/index.tsx`**: Ponto de entrada visual (Home/Welcome).

### 🧠 Pasta `/src` (Lógica de Negócio)
*Mantemos a inteligência do app fora da pasta de rotas para garantir o princípio SOLID.*
- **`features/`**: Módulos independentes por funcionalidade (Auth, Agenda, Perfil).
- **`components/`**: UI Base compartilhada (Botões, Inputs, Cards).
- **`mocks/`**: Dados estáticos que simulam a API para desenvolvimento rápido.
- **`navigation/`**: Lógica extra de navegação condicional (Auth vs Main).

---

## 🧭 4. True North — Onde Começar
> Abordagem Design First: Validamos a interface e UX antes da integração final.

1. **Ponto de Partida:** `app/(tabs)/index.tsx` — Atualmente contém a tela de validação.
2. **Ordem de Execução:**
    - Criar interfaces visuais básicas em `src/features/auth`.
    - Definir contratos de dados em `src/mocks/`.
    - Implementar fluxo de troca de perfil (Recepcionista <-> Paciente).

---

## 📜 5. Convenções
- **Nomenclatura:** camelCase para variáveis, PascalCase para componentes.
- **Idioma:** Código e Documentação em Inglês; Diálogo e Logs em Português.
- **Commits:** Padrão Conventional Commits.
- **Não deletar:** Registros são marcados com `status`, nunca removidos do banco.

# 🗺️ ODONTOSYNC — Workspace Context

Este documento é a nossa "Fonte da Verdade". Ele descreve a arquitetura, as tecnologias e o mapa de navegação do projeto para garantir a continuidade e escalabilidade.

---

## 🚀 1. Identidade do Projeto
- **Objetivo:** Gestão odontológica com notificações inteligentes e dois perfis de uso (Recepcionista/Paciente).
- **Abordagem:** Design First / Frontend First.
- **Framework:** React Native + Expo (SDK 51+).
- **TypeScript:** Strict TS.
- **Governança:** Continuous Flow (Senior-Level Protocol).

---

## 🛠️ 2. Stack Tecnológica
- **Mobile:** React Native, Expo Router v3.
- **Estilização:** NativeWind v5 (Tailwind CSS).
- **Estado/Mocks:** Zustand, Zod.
- **Package Manager:** pnpm.
- **Elo Central:** O número de telefone é o identificador universal do ecossistema.

---

## 📂 3. Estrutura de Pastas (Mapa de Bordo)

O projeto utiliza o **Expo Router** (roteamento baseado em arquivos), onde a estrutura de pastas define as telas do app, aliado a um backend em **Fastify**.

### 📱 Pasta `/app` (Roteamento Mobile)
- **`_layout.tsx`**: Raiz global. Configura provedores de contexto, estilos e executa navegação RBAC condicional baseada na autenticação.
- **`(auth)/`**: Rotas públicas de login, registro de pacientes e recuperação de senha.
- **`(admin)/`**: Painel e rotas restritas para a Recepcionista (Agenda, Lista de Pacientes, Configurações).
- **`(client)/`**: Painel e rotas privadas para os Pacientes (Visualização de Consultas, Agendamento, Perfil).

### 🧠 Pasta `/src` (Lógica de Negócio Mobile)
*Isolamos a inteligência fora do roteamento seguindo rigorosamente os princípios SOLID.*
- **`components/ui/`**: Componentes atômicos de interface (Buttons, Inputs, Badges, Cards, etc.) estilizados com NativeWind v5.
- **`mocks/`**: Simulação completa da API REST para viabilizar desenvolvimento Design-First off-line.
- **`schemas/`**: Schemas de validação de dados (Zod) compartilhados.
- **`services/`**: Serviços desacoplados (`AuthService`, `AppointmentService`) que encapsulam regras de negócio e consumo de dados.
- **`stores/`**: Gerenciamento de estado leve e modular com Zustand (`authStore`, `appointmentStore`, etc.).

### 💻 Pasta `/backend` (Servidor API)
- **`src/server.ts`**: Ponto de entrada Fastify configurado com CORS, JWT e decorators de proteção (`requireAdmin`).
- **`src/modules/`**: Módulos divididos por contexto de negócio (Auth, Appointments, Patients, Clinic) contendo rotas e lógica.
- **`prisma/schema.prisma`**: Modelagem de dados para banco PostgreSQL rodando na infraestrutura Neon DB.

---

## 🧭 4. True North — Onde Começar
> Camada de dados e segurança 100% blindada. Próximos passos de integração e produção:

1. **Configuração de Ambiente (DB)**: Configurar o arquivo `backend/.env` com a string de conexão física do Neon DB e executar `npx prisma db push` para subir as tabelas estruturadas no banco relacional.
2. **Plugar Camada de Serviços**: Substituir o consumo de mocks em `src/services/` por chamadas HTTP reais via Axios/Fetch apontando para o servidor Fastify (`http://localhost:3333/api`).
3. **Validação E2E**: Testar os fluxos ponta a ponta (Paciente agendando -> Recepcionista gerenciando a fila na agenda).

---

## 📜 5. Convenções
- **Nomenclatura:** camelCase para variáveis, PascalCase para componentes.
- **Idioma:** Código e Documentação em Inglês; Diálogo e Logs em Português.
- **Commits:** Padrão Conventional Commits.
- **Não deletar:** Registros são marcados com `status` / inativos, nunca removidos do banco.

---
*Última atualização: 2026-05-18*

## 📓 Progress Log
> Mantido via `/log`.

<!-- LOG_START -->
- [2026-05-10] setup: Sincronização do repositório remoto e preservação da arquitetura local
  - What: Resolvido conflito de arquivos de configuração, mesclando estrutura base do Expo sem sobrepor a governança local de arquivos Markdown.
  - Workflows: `/log`, `/arch`, `/doc`
  - Next: Avançar para a conclusão das configurações iniciais (Alias, Lint, NativeWind).
- [2026-05-15] feat: Criação de rotas RBAC, Zustand Stores, Mocks e UI premium
  - What: Criadas rotas e telas completas de autenticação, admin e cliente com Zustand Stores e Mocks desacoplados.
  - Workflows: `/build`, `/arch`
  - Next: Refatoração profissional de produção e criação do backend.
- [2026-05-18] refactor: Blindagem arquitetural com Services e criação do backend Fastify
  - What: Implementada camada de Services para desacoplamento de estado e criada API REST protegida por JWT/RBAC com Fastify/Prisma.
  - Workflows: `/refactor`, `/build`
  - Next: Integrar frontend com backend real rodando no banco Neon DB.
- [2026-05-18] feat: Integração ponta a ponta Fastify + Neon DB e compatibilidade web
  - What: Substituição de mocks por chamadas reais, criação do interceptador de token JWT, utilitário Alert cross-platform e semeadura completa do banco de dados Neon.
  - Decisions: Implementação de um módulo de Alert polimórfico para evitar travamentos de modais no Expo Web e sincronização do status de falta para ABSENT.
  - Workflows: `/commit`, `/log`
  - Next: Iniciar testes funcionais e de usabilidade no simulador para refinar o design e interações do aplicativo.
- [2026-05-21] refactor: Substituição definitiva de Mocks pela API e Refinamentos de UI/UX
  - What: Criação de rotas `/clinic/services` no backend, atualização do script de seed com pacientes do frontend, e substituição dos `mockServices`/`mockUsers` por integração via `ClinicService` no frontend. Substituição dos `Pickers` nativos por Dropdowns dinâmicos.
  - Decisions: Máscaras de input refatoradas (baseadas em slice) para permitir navegação livre do cursor sem bugs do React Native Web.
  - Workflows: `/refactor`, `/log`
  - Next: Melhorar validação no formulário de Agendamento e implementar UI interativa para disparo de mensagens de WhatsApp.
<!-- LOG_END -->
