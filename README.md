# 🦷 OdontoSync

> **Gestão Odontológica Inteligente.** Uma experiência mobile premium para Recepcionistas e Pacientes, focada em automação e conectividade.

---

## 📱 O Projeto

O **OdontoSync** nasce para resolver o gap de comunicação entre consultórios e pacientes. Através de uma interface intuitiva e uma arquitetura robusta, o app permite a gestão completa de agendamentos e notificações automatizadas via Push e WhatsApp.

### 🌟 Diferenciais
- **Elo Central**: Vínculo inteligente de agendamentos via número de telefone.
- **Dual Role**: Experiências personalizadas para pacientes e profissionais.
- **Design-First**: Foco total em UX/UI antes da integração com o backend.

---

## 🛠️ Stack Tecnológica

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/NativeWind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443322?style=for-the-badge&logo=react&logoColor=white)

- **Engine**: Expo SDK (Workflow Gerenciado).
- **Estilização**: NativeWind (Tailwind CSS v4).
- **Estado**: Zustand + Zod para schemas e mocks.
- **Navegação**: Expo Router (File-based routing).

---

## 🚀 Como Iniciar

### 📋 Pré-requisitos
- **Node.js**: `v20.x` (LTS).
- **pnpm**: `v8.x` ou superior.
- **Mobile**: Emulador Android/iOS ou o app **Expo Go** no celular.

### ⚙️ Instalação
1. Clone o repositório e acesse a pasta.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o ambiente de desenvolvimento:
   ```bash
   npm start
   ```

---

## 🧭 Guia de Navegação (True North)

Este projeto segue a filosofia de **Construção por Camadas**. Antes de codificar, entenda o mapa:

1.  **Arquitetura**: Consulte o [ARCH.md](./ARCH.md) para entender os fluxos de dados.
2.  **Mocks**: Veja em `src/mocks/` como os dados são estruturados antes da API.
3.  **Features**: Cada funcionalidade (Auth, Agenda) reside em sua própria pasta em `src/features/`.
4.  **UI Kit**: Componentes base reutilizáveis estão em `src/components/`.

---

## 🗺️ Roadmap MVP

- [x] Definição de Governança e Arquitetura.
- [ ] Inicialização do App e Configuração do NativeWind.
- [ ] Fluxo de Autenticação Mockado.
- [ ] Agenda da Recepcionista (Visualização).
- [ ] Minhas Consultas (Perfil do Paciente).
- [ ] Integração com WhatsApp (Deep Link).

---

## 👤 Autor
**Paulo Henrique**  
**Levi Duarte**

---
> [!TIP]
> Use o comando `pnpm test` (em breve) para validar a integridade dos mocks e componentes antes de realizar um commit.
