# 🗺️ Guia de Arquitetura — OdontoSync

Este documento explica como o projeto está organizado, o papel de cada pasta e as tecnologias que sustentam o app.

---

## 🚀 1. A Filosofia: Expo Router (File-based Routing)
O OdontoSync utiliza o modelo mais moderno do Expo. Diferente do modelo antigo onde as rotas eram configuradas em um código complexo, aqui **a estrutura de pastas define as telas**.

### Regras de Ouro:
- Arquivos com nome `index.tsx` são a rota raiz daquela pasta.
- Arquivos com nome `_layout.tsx` configuram o que aparece em volta de todas as telas daquela pasta (Ex: Menus, Cabeçalhos, Provedores de Dados).
- Pastas com parênteses `(tabs)` servem apenas para organização e não aparecem no caminho da rota.

---

## 📂 2. Mapa do Projeto

```text
OdontoSync/
├── app/                # 📱 Roteamento e Telas (Onde o usuário "navega")
├── src/                # 🧠 Lógica de Negócio (Onde o código "pensa")
├── assets/             # 🎨 Recursos Visuais (Imagens, Fontes)
├── components/         # 🧩 UI Base (Botões, Inputs genéricos)
└── constants/          # ⚙️ Configurações (Cores, Temas)
```

---

## 📑 3. Detalhamento de Pastas e Arquivos

### 🟦 Pasta `app/` (O Esqueleto do App)
| Arquivo/Pasta | Responsabilidade |
| :--- | :--- |
| `_layout.tsx` | **Layout Raiz.** Carrega fontes, splash screen e define o Stack inicial. |
| `(tabs)/` | **Grupo de Navegação.** Organiza telas que compartilham o mesmo contexto (Ex: Dashboard). |
| `(tabs)/_layout.tsx` | Configura como as telas internas se comportam (atualmente simplificado para um Stack). |
| `(tabs)/index.tsx` | **Tela de Boas-Vindas.** O ponto de entrada visual do usuário. |
| `+not-found.tsx` | Tela de fallback caso o usuário caia em um caminho inexistente. |

### 🟩 Pasta `src/` (O Coração do Produto)
*Esta pasta separa o código da ferramenta (Expo) da regra de negócio do OdontoSync.*
- **`features/`**: Pasta modular. Se formos criar o "Agendamento", teremos `features/appointments/`. Isso mantém o código limpo e fácil de encontrar.
- **`mocks/`**: Crucial para o nosso modelo **Design First**. Aqui criamos dados falsos para testar o app sem precisar de um servidor ligado.
- **`styles/`**: Onde mora o Design System (Cores premium, espaçamentos, Tailwind).

### ⚙️ Arquivos de Configuração
- **`app.json`**: Configurações globais do Expo (Nome, Versão, Plugins).
- **`tsconfig.json`**: Regras do TypeScript (Strict Mode ativado para maior segurança).
- **`package.json`**: Lista de bibliotecas instaladas (React, Expo, NativeWind).

---

## 🛠️ 4. Stack Tecnológica
- **Framework:** React Native + Expo (SDK 51+).
- **Estilização:** NativeWind v5 (Tailwind CSS no Mobile).
- **Linguagem:** TypeScript (Strict).
- **Navegação:** Expo Router v3.

---

## 🎯 5. Como evoluir o projeto?
1. **Deseja criar uma nova tela?** Adicione um arquivo em `app/`.
2. **Deseja criar um novo componente reutilizável?** Adicione em `src/components/`.
3. **Deseja simular um novo dado da API?** Adicione em `src/mocks/`.
