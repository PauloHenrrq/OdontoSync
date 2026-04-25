# OdontoSync Mobile App
> MVP de Gestão Odontológica com foco em agendamentos, notificações automáticas e perfis de uso (Recepcionista/Paciente).

## ⚠️ Pré-requisitos de Ambiente (Environment Setup)
Antes de rodar qualquer comando `install`, garanta que sua máquina atende aos requisitos exatos abaixo. Esta stack não funciona corretamente com versões muito antigas do Node ou gerenciadores de pacote conflitantes.

### 1. Core Requirements
- **Node.js:** Versão `20.x` (LTS ativa). *Não utilize a v21 ou superior ainda para evitar conflitos no Metro Bundler.*
- **Package Manager:** `pnpm` (Versão 8 ou 9). *Não utilize npm ou yarn neste projeto para garantir a integridade do lockfile.*

### 2. Mobile Environment (Escolha um caminho)
Para o desenvolvimento em Expo, você tem duas opções de visualização:

**Caminho A: Emulador Local (Recomendado para fluidez de dev)**
- **Android Studio:** Instalado com Android SDK Platform 34 (UpsideDownCake) e um Virtual Device (AVD) configurado.
- *Ou* **Xcode:** (Somente macOS) com iOS Simulator configurado.

**Caminho B: Dispositivo Físico (Mais rápido para começar)**
- Instale o app **Expo Go** no seu celular físico (disponível na App Store / Play Store).
- Necessário que celular e computador estejam na mesma rede Wi-Fi.

---

## 🚀 Getting Started

Siga estes passos estritamente nesta ordem:

1. **Instale as dependências:**
   ```bash
   pnpm install
   ```
2. **Inicie o servidor de desenvolvimento (Expo):**
   ```bash
   pnpm start
   ```
3. Pressione `a` no terminal para abrir no Android Emulator, `i` para iOS Simulator, ou escaneie o QR Code com o Expo Go no seu celular físico.

---

## 🧭 True North — Onde Começar
Este projeto segue a abordagem **Design First / Frontend First**. Não estamos conectados a nenhuma API real ainda. Toda a lógica de estado está sendo mockada na própria aplicação.

- **Start reading:** `WORKSPACE.md` e `GEMINI.md` — Para entender as regras de negócio, a arquitetura e o que é inegociável.
- **Start coding:** `src/mocks/` e `src/features/` — Onde a interface visual está ganhando vida com base nos contratos estáticos (Zod).
- **Recommended order of execution:**
  1. Visualize os Mocks (`src/mocks`).
  2. Entenda a navegação por rotas (`src/navigation`).
  3. Altere as telas em (`src/features`).

---

## 🛠️ Stack e Convenções
- **Frontend:** React Native + Expo + TypeScript (Strict).
- **Estilização:** NativeWind (TailwindCSS).
- **Gerenciamento de Estado e Mocks:** Zustand + Zod.
- **Formatação e Qualidade:** ESLint + Prettier (Regras estritas aplicadas).
- **Padrão de Commits:** Semantic Commits (feat, fix, chore) em Inglês.