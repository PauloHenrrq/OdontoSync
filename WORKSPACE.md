# ODONTOSYNC — Workspace Context

## Project Identity
- **Goal:** Gestão odontológica com notificações automáticas e dois perfis de uso.
- **Type:** Frontend App (React Native / Expo).
- **Focus:** Design First, UX/UI & Scalable Client Architecture.
- **Size:** Medium (MVP em 2-3 meses).
- **Governance:** Continuous Flow.
- **TypeScript:** Strict TS.
- **SOLID:** Sim (Foco em componentes e hooks desacoplados).
- **Architecture:** Feature-based com separação de Data (Mocks) e UI.
- **Criticism:** Standard.

## Active Stack
- **Frontend:** React Native, Expo, TypeScript.
- **Styling:** NativeWind (TailwindCSS).
- **State/Data:** Zustand, Zod (Mocks iniciais).
- **Package Manager:** pnpm.
- **Backend/API:** Será construído em repo separado posteriormente.

## Folder Structure + Responsibilities
```text
/
├── src/
│   ├── features/       # Módulos do App (Auth, Agenda, Perfil)
│   ├── components/     # UI base compartilhada
│   ├── mocks/          # Dados estáticos simulando a API
│   └── navigation/     # Configuração de rotas condicionais
├── .gemini/            # Configurações do agente
├── WORKSPACE.md        # Este arquivo (Mapa do Projeto)
├── ARCH.md             # Diagramas e Arquitetura
├── LOGS.md             # Histórico de progresso
└── TODO.md             # Roadmap e Próximos passos
```

## True North — Onde Começar
> Abordagem Design First. Construiremos a interface validável antes da integração backend.

- **Ponto de Partida:** `src/mocks/` e `src/features/` — Definição de interfaces visuais e fluxos.
- **Ordem Recomendada:**
    1. Inicializar Expo App com TypeScript.
    2. Criar Mocks de Usuário (Recepcionista/Paciente) e Agendamentos.
    3. Implementar Navegação Condicional (Auth Stack vs Main Stack).
    4. Estruturar Telas Base (Login, Lista de Agenda do Dia).

## Project Conventions
- **Naming:** camelCase para variáveis/funções, PascalCase para componentes/classes.
- **Language:** Código e Docs em Inglês; Diálogo e Logs em Português.
- **Commits:** Conventional Commits.
- **Estratégia de Notificação:** O telefone é o ID único de vínculo (Elo Central).

## Progress Log
> Mantido via `/log`.

<!-- LOG_START -->
- [2026-04-24] Projeto inicializado via `/init`. Estrutura documental estabelecida.
<!-- LOG_END -->
