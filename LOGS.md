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

## 2026-05-26

- **Task:** Refinamento do Fluxo e Exibição de Agendamentos (Status Pendente → Agendado).
- **Status:** Concluído.
- **Ações:**
  - **Atualização de Status (Badge.tsx):** Redefinido o comportamento visual de `AppointmentStatus.PENDING` no componente `<Badge />`. O status agora é renderizado na interface como **"Agendado"** em um tom verde claro elegante (`bg: '#E8F5E9'`, `text: '#2E7D32'`), alinhando-se à lógica de que todo agendamento na clínica já entra em estado ativo/confirmado de imediato.
  - **Harmonização Visual da Agenda (agenda.tsx):** Alterado o mapeamento de cores `statusColors` para associar o status `PENDING` diretamente à cor verde escuro (`#2E7D32`), garantindo que a borda lateral esquerda de destaque dos cartões de consulta reflita a nova identidade verde de confirmação instantânea.
  - **Refatoração de Ações no Card (agenda.tsx):** Simplificadas as ações rápidas do cartão de consulta em estado de agendamento inicial. O botão redundante de "Confirmar" foi removido por completo, deixando **exclusivamente o botão de "Cancelar"**, conferindo um fluxo de agendamento mais conciso, KISS e direto ao ponto.
  - **Sincronização no Dashboard Principal (index.tsx):** Ajustado o card de KPI da Home de Admin. O indicador de "Pendentes" (laranja médico) foi substituído pelo indicador de **"Agendados"** em tom verde escuro (`#2E7D32`), assegurando consistência total em todo o painel gerencial.
  - **Otimização de Performance no Agendamento (agenda.tsx):** 
    - Removido o bloqueio síncrono `await` na requisição `fetchPatients()` no sucesso do agendamento, permitindo que a lista de pacientes atualize em background e o modal feche **instantaneamente**.
    - Implementado spinner de `ActivityIndicator` no botão de "Salvar Agendamento" e desabilitação automática do botão durante o estado ativo de `isLoading`, prevenindo cliques duplicados por parte da recepcionista e melhorando significativamente a UX de resposta.
  - **Fluxo de Contato e Notificação Customizável (patients.tsx):**
    - Redesenhada a interface do modal de contato semi-automático. As mensagens de Lembrete e Cancelamento agora são representadas por tabs side-by-side integradas de alta densidade visual.
    - Adicionado um editor em tempo real (TextInput multiline) que exibe a mensagem de template pré-formatada reativa (sincronizada com o paciente e consulta de referência), permitindo personalização pré-envio.
     - Criado o botão **"Enviar WhatsApp"** centralizado e com largura total (100% de flex) direcionando via API oficial de deep-linking `wa.me` com o texto editado, removendo o botão de e-mail e simplificando o processo de contato da recepcionista.
    - Removido o painel inferior de **"Próximas Datas"** do modal de contato rápido, tornando a interface de contato direta, leve, limpa e extremamente focada na ação de disparo da mensagem pré-configurada.
    - **Leitor Automático de Variáveis Adaptável:** Refatorada a função `formatTemplate` com expressões regulares flexíveis e case-insensitive (`/gi`). O sistema agora substitui automaticamente qualquer placeholder escrito no banco, seja com chaves ou colchetes: `{nome}`, `[NOME]`, `{data}`, `[DATA]`, `{hora}`, `[HORA]`, `{telefone}`, `[TELEFONE]`, `{clinica}`, `[CLINICA]`.
  - **Sugestões de Campos no Editor de Templates (settings.tsx):**
    - Adicionado suporte a chips de sugestão reativos na janela modal de "Editar Mensagem" nas configurações.
    - Exibido um ScrollView horizontal com atalhos visuais: `[NOME]`, `[DATA]`, `[HORA]`, `[CLINICA]`, `[TELEFONE]`. Ao tocar em qualquer chip, a variável correspondente é inserida instantaneamente ao final do texto, guiando o usuário de maneira interativa e prevenindo erros de digitação.
  - **Ação de Falta Reintegrada na Agenda (agenda.tsx):**
    - Adicionado novamente o botão **"Falta"** (com ícone `AlertTriangle` e estilo de alerta `#E65100`) no card de consultas sob o status `PENDING` (Agendado), permitindo que a recepcionista registre a ausência de um paciente diretamente a partir de um agendamento marcado ativo, garantindo controle completo.
- **Próximo Passo:** Implementar o Sino de Notificação, Smart Banner duplo e fluxo de contato WhatsApp na Agenda.

## 2026-05-26 (Sino, Smart Banner e Blindagem do Admin)

- **Task:** Implementação de Sino, Smart Banner de dois estados, Validações Visuais e Máscaras de Agendamento.
- **Status:** Concluído.
- **Ações:**
  - **Sino de Notificação e Badge Reativo (agenda.tsx):** Adicionado o ícone do Sino no cabeçalho administrativo com badge dinâmico que calcula e exibe de forma reativa a quantidade de lembretes pendentes para amanhã.
  - **Smart Alert Card de Dois Estados (agenda.tsx):** Desenvolvido o Banner Inteligente com dois estados visuais. O Banner Laranja é ativado se houver pendências (*"Ações Requeridas Hoje"*), e o Banner Verde é exibido se tudo estiver em dia (*"Tudo sob Controle!"*). Ambos conectam-se diretamente à Central de Lembretes ao toque.
  - **Validação de Formulário com Erros Visuais (agenda.tsx):** Criado o estado reativo `validationErrors` e integrado aos campos obrigatórios (Telefone, Serviço, Data, Horário) no modal de Novo Agendamento. Caso a recepcionista tente salvar com dados ausentes, o formulário exibe uma borda vermelha com fundo avermelhado suave (`#FFEBEE`) nos campos inválidos, gerando feedback instantâneo de alta fidelidade visual.
  - **Máscara de Inputs e Reset de Estados (agenda.tsx):** Implementado o helper centralizado `closeNewAptModal` que limpa todos os estados de erro e campos de inputs ao salvar ou fechar o modal de criação.
  - **Sincronização Ativa da Tela Início (index.tsx):** Adicionado `useFocusEffect` com o `useCallback` do React e conectadas as chamadas dinâmicas das Stores (`fetchAppointments`, `fetchPatients`, `fetchServices` e `fetchConfig`). Agora, sempre que a recepcionista abre a tela principal ("Início") ou navega de volta para ela, o dashboard é recarregado instantaneamente em plano de fundo com as estatísticas em tempo real, atualizando os KPIs e os próximos agendamentos de hoje de acordo com o Neon PostgreSQL, sem dados estáticos ou travados de cache.
  - **Seguimentador de Escopo no Dashboard (index.tsx):** Adicionado um controle reativo por abas (Segmented Control/Tab Capsule) com design premium ("Hoje" vs "Geral (Anual)") permitindo alternar instantaneamente a perspectiva estatística do dashboard de administração. A aba "Hoje" foca na produtividade diária e calcula as taxas relativas ao dia atual, enquanto a aba "Geral" compila o histórico consolidado de todos os agendamentos salvos no banco. Os labels dos KPIs e os valores alteram-se de forma fluída e reativa.
  - **Melhoria no Título Header:** Removido o padding nativo de `s.title` e transferido o alinhamento para o contêiner flexbox `headerRow`, posicionando o texto *"Agenda da Clínica"* perfeitamente flush no início esquerdo e emparelhado simetricamente ao Sino na direita.
  - **Limpeza Visual do Card de Agendamento (index.tsx):** Removido o indicador de duração do serviço (ex: `30min`, `45min`) que ficava abaixo do horário das consultas na lista de "Agenda de Hoje" no Dashboard, simplificando a interface para focar nas informações centrais (Paciente, Serviço, Dentista e Status). A remoção foi feita com limpeza paralela da classe de estilo atrelada, garantindo código limpo.
- **Próximo Passo:** Iniciar os testes automatizados E2E (End-to-End) com Playwright nas telas administrativas da Agenda, Pacientes e Dashboard para blindar todo o painel de administração contra regressões visuais e lógicas.

## 2026-05-26 (Sincronização Completa do Cliente & TypeScript Fiel)

- **Task:** Integração Real do Lado do Cliente e Sincronização ao Foco.
- **Status:** Concluído.
- **Ações:**
  - **`useFocusEffect` em Pacientes (patients.tsx):** Adicionada sincronização em tempo real na tela de Pacientes para recarregar a lista do Neon PostgreSQL em segundo plano sempre que a tela ganha foco.
  - **Remoção de Mocks no Agendamento do Cliente (booking.tsx):** Substituídos os serviços estáticos (`mockServices` com IDs `svc_xxx`) por dados de serviços dinâmicos do banco através da `useClinicStore`, prevenindo erros de validação UUID/foreign key no banco ao agendar consultas.
  - **Remoção de Mocks na Home do Cliente (index.tsx):** Substituída a busca estática de serviços no agendamento por dados reais da `useClinicStore`, garantindo que o nome exato do tratamento seja exibido no cartão "Próximo Agendamento".
  - **Sincronização de Foco no Cliente (index.tsx & profile.tsx):** Adicionados hooks `useFocusEffect` na Home e no Perfil do Paciente para garantir que alterações feitas em agendamentos sejam exibidas na interface do usuário instantaneamente sem necessidade de recarregar a aplicação.
  - **Validação de Tipagem TS Completa:** Verificada toda a aplicação com `npx tsc --noEmit` apresentando compilação 100% livre de erros.
- **Próximo Passo:** Implementação de testes automatizados de ponta a ponta (E2E) com Playwright para os fluxos da Agenda, Dashboard e Agendamento do Cliente.
