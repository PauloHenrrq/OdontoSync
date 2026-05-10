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

---
*Última atualização: 2026-04-26*
