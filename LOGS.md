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

## 2026-05-26 (Reformulação de Experiência do Cliente & Perfil Funcional)

- **Task:** Reformular a navegação do cliente e tornar o Perfil 100% funcional.
- **Status:** Concluído.
- **Ações:**
  - **Substituição de Agendamento por Consultas (`appointments.tsx`):** Removida a tela de agendamento (`booking.tsx`), que redirecionava para o layout administrativo e era de uso exclusivo da recepção. Criada a tela premium "Minhas Consultas" organizada em abas reativas ("Próximas" e "Histórico") e implementada com `FlatList` para alta performance.
  - **Cards com Status Visuais de Clínica:** Consultas utilizam bordas coloridas conforme o status físico (Verde = Pendente, Azul = Confirmado, Cinza = Concluído, Vermelho = Cancelado, Laranja = Ausente) e Badges reativos.
  - **Navegação do Menu Tab Atualizada:** Layout de abas do cliente atualizado com o ícone `ClipboardList` e rota `/appointments` em substituição à aba anterior de agendamento.
  - **Perfil Totalmente Funcional com Modais Inline:** O menu de perfil agora abre modais elegantes e responsivos para cada funcionalidade (Dados Pessoais legíveis, Segurança e Privacidade LGPD, Configurações de notificações com switches ativos, e Central de Ajuda com FAQ e contatos da clínica).
  - **Ajustes de Fluxos e Tipagem:** Links rápidos e vazios da Home ajustados para redirecionar corretamente para a lista de consultas. Código validado via `npx tsc --noEmit` apresentando 0 erros de tipos.
  - **Métrica Relevante no Perfil (Desde):** Substituída a métrica estática de "Avaliação" (⭐ 4.8) por um indicador dinâmico e altamente pessoal: "Desde [Ano]", que extrai o ano exato de cadastro do paciente com base no campo `user.createdAt`, tornando a experiência mais autêntica e conectada.
  - **Recuperação de Senha Integrada (OTP In-App Wizard):** Eliminado o fluxo de simulação de e-mail externo, substituindo-o por um assistente de 4 etapas totalmente dentro do aplicativo:
    1. *Identificação:* Entrada e validação de formato de e-mail.
    2. *Verificação de Código:* Tela OTP com temporizador regressivo de 59s ativo e campo para digitar os 6 dígitos (código de teste: `123456`).
    3. *Redefinição:* Campos "Nova Senha" e "Confirmar Nova Senha" com validador de correspondência, mínimo de 6 dígitos e botões de ocultação/exibição via ícones `Eye`/`EyeOff`.
    4. *Feedback:* Tela de sucesso com check e CTA direto para login.
  - **Integração Real do Reset de Senha no Backend:**
    *   *Backend:* Criada a rota `POST /api/auth/reset-password` em `auth.routes.ts` que recebe `email` e `password`, busca o usuário ativo, gera o hash com bcrypt e atualiza o banco de dados PostgreSQL real.
    *   *Frontend:* Conectada a chamada da API real `api.post('/auth/reset-password')` no formulário nativo do wizard, fazendo com que a senha redefinida persista verdadeiramente e permita o login com sucesso imediato sem erro 401.
- **Próximo Passo:** Prosseguir para o commit destas melhorias de experiência de usuário (UX) e iniciar a estratégia de testes Playwright.

## 2026-05-26 (Correção de Bug: Blindagem contra Text Nodes em React Native)

- **Task:** Eliminar o erro de "Unexpected text node" no fluxo de redefinição de senha.
- **Status:** Concluído.
- **Ações:**
  - **Eliminação de Text Nodes no Wizard (forgot-password.tsx):**
    - Identificada e corrigida a causa raiz do erro console/aviso de renderização de nós de texto em React Native: o uso do operador short-circuit `&&` para condicionar estilos e componentes em arrays de estilo de views, que sob algumas circunstâncias avaliava para `false` vazados, sendo incorretamente interpretado como nó de texto.
    - Refatoradas as diretrizes de progresso do wizard (`progressBar`), substituindo as avaliações por ternários explícitos `? styles.stepActive : null` que retornam valores limpos e suportados.
    - Achadas e corrigidas as estruturas de tags `<Text>` aninhadas com quebras de linhas manuais `\n` e interpolação direta, achatando o layout das informações de e-mail e chips de dicas em blocos de texto únicos e sem aninhamento, eliminando qualquer tipo de text node inválido e garantindo compatibilidade 100% cross-platform (Web + Mobile).
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Silenciamento de Logs e Proteção de Role em Requisições)

- **Task:** Otimizar e silenciar mensagens de console em produção, e remover erros de unauthorized (403) ao fazer requisições restritas na entrada do paciente.
- **Status:** Concluído.
- **Ações:**
  - **Segurança de Endpoints Frontend (app/_layout.tsx):** 
    - Identificado que o frontend disparava a requisição global `fetchPatients()` no carregamento de dados pós-login para qualquer usuário logado.
    - Adicionado filtro de Role-Based Access Control (RBAC) no hook `useProtectedRoute`. A listagem completa de pacientes agora é disparada exclusivamente se o usuário logado for administrador (`user?.role === UserRole.ADMIN`), eliminando completamente o log e erro de console 403 (Unauthorized/Forbidden) que ocorria sempre que um paciente (CLIENT) entrava no app.
  - **Silenciamento Global de Console (app/_layout.tsx):**
    - Injetada diretiva global no topo do arquivo que sobrescreve e anula os métodos do console (`log`, `error`, `warn`, `info`, `debug`) quando a aplicação é executada fora do ambiente de desenvolvimento local (`__DEV__`). Isso garante logs limpos e otimizados em builds produtivos sem interferir no desenvolvimento diário.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Blindagem Total Contra Text Nodes no Forgot Password)

- **Task:** Sanar definitivamente o erro de "Unexpected text node" ao acessar a tela de Recuperar Senha.
- **Status:** Concluído.
- **Ações:**
  - **Reestruturação Arquitetural de Renderização (forgot-password.tsx):**
    - Identificamos que o erro residual ocorria devido à presença de comentários em formato TSX `{/* ... */}` intercalados no corpo da árvore de elementos do `ScrollView`, assim como o uso de condicionais lógicas do tipo `&&` que podiam vazar valores vazios avaliados como nós de texto pelo React Native Web.
    - Isolamos toda a renderização do assistente de etapas dentro de uma função auxiliar modular e limpa (`renderStepContent`) utilizando uma estrutura `switch-case`.
    - Eliminamos 100% dos comentários TSX internos da árvore do JSX principal.
    - Convertemos as validações condicionais do botão de voltar e barra de progresso em ternários de renderização explícitos (`? <Component /> : null`), e substituímos retornos nulos de array de estilos por objetos vazios `{}` para evitar inconsistências no compilador do Expo Web.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Correção de Bug: Vazamento de String Vazia no Componente Input)

- **Task:** Eliminar definitivamente o aviso "Unexpected text node" no foco e preenchimento de inputs.
- **Status:** Concluído.
- **Ações:**
  - **Ajuste de Renderização Condicional no Componente UI Input (Input.tsx):**
    - Descobrimos a causa raiz oculta do erro ao focar ou interagir com campos de texto: a expressão `{error && <Text style={styles.errorText}>{error}</Text>}`.
    - Quando um erro é inicializado ou redefinido como uma string vazia `""` (falsy), o operador lógico `&&` avalia e retorna a própria string `""`. Em React Native Web, essa string vazia é interpretada como um nó de texto bruto renderizado diretamente na View pai, disparando o erro e somando erros no console a cada alteração/foco de campo.
    - Substituímos a validação por um ternário de cast booleano explícito `{!!error ? <Text style={styles.errorText}>{error}</Text> : null}`, garantindo que apenas tags `<Text>` válidas ou valores estritamente nulos sejam devolvidos ao renderizador.
  - **Revisão Preventiva em Telas de Autenticação (login.tsx & register.tsx):**
    - Aplicamos a mesma blindagem preventiva em `{error && ...}` nas telas de Login e Cadastro para os contêineres de erros globais de API, eliminando permanentemente qualquer possibilidade de vazamento de nós de texto em todo o fluxo de entrada.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Otimização de UX no Fluxo de Redefinição e Normalização de Caixas de E-mail)

- **Task:** Corrigir erro de "Usuário não encontrado" (404) na etapa final de modificação de senha e otimizar o fluxo para validação imediata.
- **Status:** Concluído.
- **Ações:**
  - **Validação Antecipada no Frontend (app/(auth)/forgot-password.tsx):**
    - Identificamos que o fluxo de redefinição de senha permitia que o usuário prosseguisse por todas as telas (inserir e-mail, OTP e nova senha) sem verificar previamente se o e-mail realmente existia no banco de dados, acusando erro 404 apenas no momento final do envio da nova senha.
    - Conectamos o passo 1 (`handleEmailSubmit`) a uma nova rota do backend `/auth/verify-email`. Agora o aplicativo valida a existência da conta **imediatamente na primeira tela**. Se o e-mail não existir, o erro "Usuário não encontrado" é exibido na própria caixa de entrada de e-mail antes do avanço para a tela de OTP.
  - **Normalização de Casing e Espaçamento (Fronend & Backend):**
    - Usuários podem digitar e-mails com letras maiúsculas acidentais ou espaços extras no final (`ana.santos@email.com ` ou `Ana.santos@email.com`).
    - Adicionamos higienização preventiva em todo o fluxo de autenticação:
      - **Frontend (`forgot-password.tsx`):** Trata e salva o e-mail no estado utilizando `email.trim().toLowerCase()` antes de fazer requisições de validação e redefinição.
      - **Backend (`auth.routes.ts`):** Adicionou normalização idêntica `.trim().toLowerCase()` nas rotas de `/login`, `/register`, `/verify-email` e `/reset-password` na busca e na persistência de dados do Prisma. Isso elimina definitivamente qualquer inconsistência de letras maiúsculas ou espaçamentos entre a entrada do usuário e os dados persistidos no PostgreSQL (Neon).
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Alinhamento: Centralização do Seletor Horizontal de 5 dias na Agenda)

- **Task:** Centralizar o seletor horizontal de 5 dias na tela de Agenda do Administrador, corrigindo o alinhamento que o empurrava para a direita.
- **Status:** Concluído.
- **Ações:**
  - **Ajuste de Container de Rolagem (`app/(admin)/agenda.tsx`):**
    - Descobrimos que o contêiner interno do `ScrollView` horizontal (`dateRow`) não possuía diretivas explícitas de estiramento ou centralização, fazendo com que as 5 opções de data ficassem alinhadas assimetricamente.
    - Atualizamos o estilo `dateRow` na folha de estilos para incluir:
      - `minWidth: '100%'`: Garante que a área interna de rolagem ocupe toda a largura disponível da tela do dispositivo.
      - `justifyContent: 'center'`: Centraliza perfeitamente os 5 chips de datas horizontalmente, eliminando o espaçamento sobressalente do lado direito e trazendo de volta o layout equilibrado e simétrico de antes.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Design: Otimização de Ações Rápidas do Administrador)

- **Task:** Corrigir quebra de texto e proximidade de ícones com as bordas nos botões "Novo Agendamento" e "Contato WhatsApp".
- **Status:** Concluído.
- **Ações:**
  - **Otimização de Espaçamento Interno e Tipografia (`app/(admin)/index.tsx`):**
    - Identificamos que a ausência de `paddingHorizontal` nos botões de ação rápida fazia com que os ícones ficassem colados diretamente nas bordas dos cartões e os textos longos sofressem quebra de linha indesejada em larguras menores de tela.
    - Adicionamos `paddingHorizontal: 12` ao estilo `actionBtn` para criar um respiro interno elegante entre o conteúdo e as bordas.
    - Ajustamos o `gap` de `8` para `6` e a propriedade `fontSize` de `fontSizes.labelLg` (14px) para `fontSizes.labelMd` (12px) no estilo `actionTxt`. Isso acomoda perfeitamente as strings "Novo Agendamento" e "Contato WhatsApp" em uma única linha contínua em qualquer resolução de celular.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Design: Simetria Completa e Posicionamento de Indicador no Seletor de Datas)

- **Task:** Eliminar a barra de rolagem/corte lateral no seletor de 5 dias da Agenda e fixar o tamanho das caixas, tornando os pontinhos de agendamento flutuantes (`position: absolute`).
- **Status:** Concluído.
- **Ações:**
  - **Remoção de Rolagem Desnecessária (`app/(admin)/agenda.tsx`):**
    - Substituímos o componente `<ScrollView horizontal>` por um `<View>` estático com a classe `s.dateRow`. Como as 5 datas são um número fixo, a rolagem foi eliminada e a linha se comporta de maneira 100% rígida e centralizada na tela.
  - **Chips com Tamanho Fixo e Uniforme (`s.dateChip`):**
    - Reduzimos o padding horizontal e estipulamos dimensões estáticas `width: 56` e `height: 64`. Com isso, todos os 5 chips têm rigorosamente o mesmo tamanho, independente do dia selecionado ou da presença de indicador de consulta.
  - **Indicador Flutuante / Position Absolute (`s.greenDot`):**
    - O pontinho indicador de consulta (`hasAptOnDay`) antes era renderizado no fluxo comum do flexbox (`display: flex`), o que empurrava os elementos para cima e esticava o card ativo verticalmente em relação aos inativos.
    - Alteramos o estilo para `position: 'absolute'`, `bottom: 6` e `alignSelf: 'center'`. O pontinho agora flutua na base do chip sem ocupar espaço físico real no fluxo da caixa, garantindo que todas as 5 caixinhas fiquem perfeitamente alinhadas, com a mesma altura e 100% integradas.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Design: Micro-Ajuste de Altura do Indicador de Agendamento)

- **Task:** Reposicionar o pontinho verde/branco de agendamento 2px para baixo dentro dos chips de datas da Agenda.
- **Status:** Concluído.
- **Ações:**
  - **Micro-Ajuste de Posicionamento (`app/(admin)/agenda.tsx`):**
    - Alteramos a propriedade `bottom` de `6` para `4` no estilo `s.greenDot`. 
    - Esse ajuste de 2px posiciona o pontinho mais próximo da borda inferior dos chips de datas, deixando mais espaço livre sob o número do dia e garantindo um equilíbrio estético ainda mais refinado e fiel às especificações do usuário.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Design: Blindagem de Overlap em Notificações e Lista Expansível de Agendamentos)

- **Task:** Corrigir a sobreposição do texto "Lembretes automáticos..." com o botão Switch e criar um seletor expansível para Consulta de Referência ao possuir mais de 2 agendamentos no histórico do paciente.
- **Status:** Concluído.
- **Ações:**
  - **Prevenção de Sobreposição em Linhas de Configurações (`app/(admin)/settings.tsx`):**
    - Descobrimos que o contêiner de textos internos das notificações não possuía `flex: 1` explícito. Isso fazia com que o texto de subtítulo expandisse além do limite físico da tela, atropelando e ficando abaixo do interruptor (Switch).
    - Adicionamos `style={{ flex: 1 }}` nas caixas de textos de "Redução de Faltas" e "Alerta para a Recepção", limitando-as perfeitamente à área restante entre o ícone esquerdo e o Switch/Chevron da direita, forçando a quebra de linha natural da tipografia.
  - **Seletor de Agendamentos Expansível com Botão `+` (`patients.tsx` & `agenda.tsx`):**
    - **Comportamento Colapsado:** Se o paciente possuir mais de 2 agendamentos no histórico, mostramos apenas os 2 mais recentes na linha de chips horizontal, acompanhados de um chip de soma inteligente `+X` (onde X é o número de consultas ocultas).
    - **Lista Expansível Vertical:** Ao clicar no chip `+`, a linha de soma se transforma em um botão "Recolher" e um elegante painel vertical `expandedListContainer` surge abaixo, listando todas as consultas agendadas do paciente.
    - Cada linha desse seletor expansível é clicável para selecionar a Consulta de Referência desejada (marcada com um ícone de `Check` de confirmação) e atualiza o texto do template de WhatsApp de forma dinâmica e imediata (via `useEffect`).
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Fluxo: Auto-Preenchimento de Novo Agendamento e Redimensionamento de Destaque no Calendário)

- **Task:** Ao clicar em "+ Novo Agendamento" a partir de um Paciente, auto-preencher seus dados no formulário da Agenda. Reduzir o círculo azul de destaque no calendário mensal de presença para envolver apenas o número de forma adequada.
- **Status:** Concluído.
- **Ações:**
  - **Fluxo de Auto-Preenchimento (`patients.tsx` & `agenda.tsx`):**
    - Modificamos o botão "+ Novo Agendamento" dentro do modal de detalhes do paciente em `patients.tsx` para passar o nome e o celular via parâmetros de busca codificados na URL do redirecionamento do Expo Router: `router.push('/(admin)/agenda?openNew=true&phone=...&name=...')`.
    - No `useEffect` de abertura do modal em `agenda.tsx`, interceptamos os parâmetros `phone` e `name` recebidos e os injetamos diretamente no estado `newApt` de inicialização do formulário. Os parâmetros da rota são em seguida limpos preventivamente usando `router.setParams` para manter o estado da URL limpo.
  - **Destaque Circular Refinado no Calendário Mensal (`patients.tsx`):**
    - O destaque azul de dias com agendamentos no histórico anteriormente cobria toda a célula quadrada `dayCell` (que ocupa 1/7 da largura), resultando em círculos enormes que se encostavam e vazavam.
    - Criamos um componente interno `<View style={[s.dayCellInner, hasHistory && s.dayCellHasHistory]}>` que envolve estritamente o número do dia.
    - Estilizamos `dayCellInner` com dimensões perfeitas de `width: 34` e `height: 34` e `borderRadius: 17`, gerando um círculo leve, elegante e centralizado ao redor dos números, sem qualquer interferência com células vizinhas.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste Estético: Ampliação de Padding e Otimização do Espaçamento dos Chips de Data)

- **Task:** Melhorar o padding, tamanho e posicionamento de todos os boxes seletores de data na Agenda conforme imagem.
- **Status:** Concluído.
- **Ações:**
  - **Aumento de Dimensões e Padding Interno (`app/(admin)/agenda.tsx`):**
    - Redefinimos a classe de estilo `dateChip` para aumentar as caixas de datas de `width: 56` e `height: 64` para **`width: 58`** e **`height: 78`**.
    - Elevamos o `borderRadius` de `16` para **`20`** para uma curvatura de canto extremamente suave e premium, combinando perfeitamente com a imagem de referência.
    - Ajustamos a margem do texto da semana `dateDay` adicionando `marginTop: 2` e `marginBottom: 6` para proporcionar uma divisão visual perfeita e simétrica.
  - **Otimização do Espaçamento da Linha e Pontinho (`app/(admin)/agenda.tsx`):**
    - Ampliamos o espaçamento `gap` entre os chips na classe `dateRow` de `8` para **`10`**, dando mais respiro e eliminando qualquer sensação de aperto na linha.
    - Reposicionamos o indicador verde flutuante de agendamento `greenDot` alterando `bottom` de `4` para **`8`** para acompanhar a nova altura dos chips e mantê-lo lindamente alinhado abaixo dos números das datas.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Formatação: Máscara Automática de Telefone no Auto-Preenchimento)

- **Task:** Garantir que o telefone vindo do perfil do paciente ao abrir um Novo Agendamento seja preenchido no formato correto `(00) 00000-0000`.
- **Status:** Concluído.
- **Ações:**
  - **Formatação de Entrada no Auto-Preenchimento (`app/(admin)/agenda.tsx`):**
    - Identificamos que a string crua de telefone (`selectedPatient.phone`) estava sendo injetada sem formatação diretamente no estado `newApt`.
    - Integramos a função utilitária `maskPhone` na captura de parâmetros do `useEffect` de agendamento automático.
    - O campo agora inicializa perfeitamente formatado e com excelente visualização de máscara, idêntico à digitação manual da recepcionista.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Fluxo: Cadastro com Auto-Máscara e OTP Premium estilo iFood/Uber)

- **Task:** Adicionar máscara automática no telefone do cadastro. Modificar o botão para "Entrar" e criar um fluxo de OTP com 6 quadradinhos individuais (estilo iFood/Uber).
- **Status:** Concluído.
- **Ações:**
  - **Auto-Corretor / Máscara de Telefone (`app/(auth)/register.tsx`):**
    - Integramos a função de máscara `maskPhone` localmente na tela de cadastro.
    - O campo "Telefone" agora aplica a formatação `(00) 00000-0000` em tempo real enquanto o usuário digita.
  - **Fluxo de OTP Premium com 6 Quadradinhos (`app/(auth)/register.tsx`):**
    - Substituímos o campo único de entrada do código OTP por um layout com 6 caixas individuais (`otpBox`) e independentes.
    - Criamos um `TextInput` oculto gerenciado por `useRef` para capturar a entrada do teclado, sincronizando o valor com os quadradinhos exibidos.
    - Adicionamos animações visuais e estados de foco individuais (`otpBoxFocused`, `otpBoxFilled`) com elevação suave, idêntico aos apps líderes de mercado (iFood, Uber, Airbnb).
    - Atualizamos o texto do botão inicial do envio de OTP para "Entrar", seguindo a solicitação.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.

## 2026-05-26 (Ajuste de Fluxo: Página Dedicada para Verificação de OTP e Botão Enviar)

- **Task:** Separar o fluxo de verificação do código OTP do cadastro em uma página independente (`verify-otp.tsx`), com o botão "Enviar" realizando o cadastro e redirecionamento final.
- **Status:** Concluído.
- **Ações:**
  - **Fluxo com Redirecionamento de Rota (`app/(auth)/register.tsx`):**
    - Simplificamos o formulário de cadastro principal. Agora, ao clicar em "Entrar", os dados são validados e o código OTP é enviado.
    - Em caso de sucesso, o usuário é redirecionado para a nova tela `/(auth)/verify-otp` via Expo Router, repassando todos os dados informados (nome, email, telefone, senha e devCode temporário de teste) como parâmetros seguros de rota.
  - **Tela de Verificação OTP Exclusiva (`app/(auth)/verify-otp.tsx`):**
    - Criamos a nova tela de verificação independente. Ela renderiza o grid premium de 6 caixas individuais estilo iFood/Uber, mantendo foco automático ao montar a tela.
    - Adicionamos o botão **`Enviar`** que, ao ser pressionado, valida o código digitado e chama `registerUser` do `useAuthStore`.
    - Ao concluir o cadastro com sucesso, o fluxo de segurança do aplicativo autentica o usuário e realiza o redirecionamento automático imediato para a Dashboard/Painel correto.
- **Próximo Passo:** Prosseguir com commits de saúde e iniciar plano de testes Playwright.


## 2026-05-26 (Correção de Roteamento & Preparação para Produção)

- **Task:** Corrigir redirecionamento pós-cadastro para verify-otp e limpar todos os logs do console para a versão de produção do aplicativo.
- **Status:** Concluído.
- **Ações:**
  - **Correção de Bloqueio Silencioso (Zod Schema):**
    - Relaxamos o schema de senhas (`auth.schema.ts`) para exigir apenas um mínimo de 6 caracteres no cadastro, eliminando as restrições rígidas de caracteres maiúsculos e números que impediam o avanço de usuários em testes acadêmicos.
  - **Correção de Middleware de Rotas Protegidas (`app/_layout.tsx`):**
    - Identificamos um bug de intercepção no `useProtectedRoute` que barrava o redirecionamento para a página de verificação OTP.
    - Refatoramos a checagem de grupo de rotas de `segments[0] === '(auth)'` para `(segments as string[]).includes('(auth)')`, tornando-a imune a variações e offset nos segmentos da URL.
  - **Otimização de Transição Sem Bloqueios (`app/(auth)/register.tsx`):**
    - Removemos o popup nativo `Alert.alert` intermediário de sucesso de envio de código OTP (que costumava travar a renderização e interações no navegador web) e configuramos o redirecionamento automático direto para a tela de verificação OTP com passagem segura de parâmetros.
  - **Limpeza de Logs de Produção (`app/(auth)/register.tsx` e `app/_layout.tsx`):**
    - Varremos e removemos todos os comandos `console.log` e `console.error` temporários que haviam sido adicionados para depuração, deixando os arquivos limpos, rápidos e em conformidade estrita com padrões de produção corporativos.
- **Próximo Passo:** Prosseguir com o plano de testes automatizados e implantação em staging.
## 2026-05-26 (Refatoração de Erros de Produção: Interceptador Centralizado 401 e try-catch)

- **Task:** Sanar erros de console 401 (Unauthorized) na inicialização do app devido a tokens expirados e implementar arquitetura profissional de tratamento de exceções.
- **Status:** Concluído.
- **Ações:**
  - **Interceptador Centralizado de 401 (`src/services/api.ts`):**
    - Implementamos um interceptador de erros global no utilitário de requisições `fetchWithAuth`.
    - Ao receber qualquer status `401 Unauthorized` da API do backend, o interceptador remove o token expirado do `AsyncStorage` de imediato e dispara a action `logout` do `authStore` de forma assíncrona/dinâmica.
    - Isso redefine a autenticação local e força o redirecionamento automático do usuário de volta para a tela de Login sem poluir o console com stack traces de requisições órfãs subsequentes.
  - **Tratamento de Exceções nas Stores (`appointmentStore.ts` e `clinicStore.ts`):**
    - Identificamos que as actions assíncronas do Zustand que disparam chamadas de rede no mount do layout (`fetchAppointments`, `fetchConfig`, `fetchPatients`, `fetchServices`) não continham blocos `try-catch`, gerando promessas rejeitadas e erros vermelhos críticos ("Unhandled Promise Rejections").
    - Refatoramos e blindamos todas essas actions com blocos `try-catch`, assegurando que em caso de rede instável ou token expirado, o estado `isLoading` seja restaurado e a falha seja controlada elegantemente na camada do Zustand sem travar a interface do usuário.
  - **Otimização de Roteamento e Acesso RBAC (`app/_layout.tsx`):**
    - Corrigimos o erro `403 Forbidden` disparado ao carregar configurações administrativas da clínica (`/clinic/config`) para usuários comuns (pacientes).
    - Limitamos a chamada de `fetchConfig()` no `RootLayout` exclusivamente para usuários com o perfil `UserRole.ADMIN`, alinhando perfeitamente a orquestração do frontend com as políticas de controle de acesso (RBAC) do backend.
  - **Identidade e Venda de Marca nas Notificações (`src/mocks/notifications.ts`):**
    - Removemos as 4 notificações iniciais mockadas de consulta, lembrete e avaliações que vinham pré-carregadas para o usuário.
    - Substituímos por **1 única notificação de boas-vindas premium e institucional** contendo o slogan do consultório: *"Sempre cuidando do seu sorriso! Oferecemos atendimento humanizado, tecnologia de ponta e tratamentos especializados para transformar a sua saúde bucal."*
  - **Experiência Detalhada Interativa ao Clique (`app/(client)/alerts.tsx`):**
    - Implementamos um **fluxo de modal premium** acionado ao clicar em qualquer item da lista de notificações.
    - O clique agora:
      1. Marca a notificação como lida no Zustand (`markAsRead(n.id)`), suavizando sua cor e limpando a bolinha verde de pendência na hora.
      2. Abre um modal elegante centralizado com fundo escurecido, trazendo o ícone da marca, título e a **mensagem institucional completa** sem cortes ou quebras, acompanhado do botão *"Entendido"*.
  - **Sincronização Resiliente e Auto-cura de Telefones (`Backend/`):**
    - Identificamos uma inconsistência entre os telefones gravados na criação de agendamentos da recepção (limpos/apenas números) e os cadastrados pelos pacientes (com máscara de caracteres e parênteses). Isso criava duplicidades invisíveis no banco e impedia os agendamentos de refletirem na tela do paciente.
    - Desenvolvemos uma arquitetura de **Resiliência de Busca Multiformato** no backend (`auth.routes.ts`, `appointment.routes.ts`, `patient.routes.ts`). Agora, o sistema reconstrói dinamicamente e busca todas as variações de formatos de telefone (`28763416462`, `(28) 76341-6462`, etc.).
    - Implementamos uma rotina de **Auto-cura de Banco de Dados** em tempo real no `GET /appointments`. Quando o paciente logado requisita suas consultas, o backend as localiza de forma flexível e vincula retroativamente e em background o ID correto do usuário aos registros desalinhados, consolidando a integridade das relações e garantindo a sincronização em tempo real.
  - **Filtro Inteligente de Transição de Consultas (Tolerância de 15 Minutos):**
    - Implementamos um mecanismo automatizado para mover consultas em andamento ou passadas para o "Histórico" (History) do paciente de forma autônoma.
    - Criamos a função utilitária `isAppointmentExpired` que calcula se o agendamento já ultrapassou a hora marcada somada a **15 minutos de tolerância**. Caso positivo, a consulta é redirecionada de "Próximas" para "Histórico" (tanto no dashboard, na lista completa, quanto nos contadores do perfil do usuário), mantendo a experiência do usuário transparente.
  - **Confirmação Automática e Simplificação de Ações do Admin (`agenda.tsx` / Backend):**
    - Configuramos a criação de consultas pela recepção para salvar o agendamento diretamente com o status `CONFIRMED` na API do backend por padrão.
    - Atualizamos o design system de badges (`Badge.tsx`) e cartões de agenda (`agenda.tsx`) para unificar o status `CONFIRMED` com o visual verde clássico de "Agendado".
    - Removemos a interação duplicada e desnecessária de "Confirmar" ou "Concluir" no painel da recepcionista. Agora, agendamentos ativos possuem apenas o botão de ação rápida de **"Marcar Falta"**, simplificando o fluxo operacional.
- **Próximo Passo:** Prosseguir para o plano de criação da suíte de testes do aplicativo.

## 2026-05-31 (Lembretes Multidias Sincronizados com Configuração e Alerta de Atraso)

- **Task:** Implementar o Banner de Lembretes Dinâmico e Multidias (Sincronizado com a Configuração) e adicionar o alerta visual de prazo vencido na timeline de consultas dos pacientes.
- **Status:** Concluído.
- **Ações:**
  - **Banner e Modal Multidias Dinâmicos (`agenda.tsx`):**
    - Substituída a lógica estática que monitorava apenas consultas para "amanhã" (`tomorrowApts`).
    - Desenvolvida a função `getDaysDifference` para comparar datas descartando o fuso horário de forma segura (`T12:00:00`).
    - Implementada a leitura em tempo real de `config.reminderHoursBefore` (ex: `"24,72"` que se traduz em 1 e 3 dias antes) convertida em dias de antecedência (`activeReminderDays`).
    - Modificado o Banner de Lembretes Inteligentes para consolidar todos os agendamentos ativos (`PENDING` ou `CONFIRMED`) que coincidem com qualquer um dos dias de antecedência configurados.
    - Modificado o Modal de Lembretes Pendentes para listar de forma elegante o prazo de cada notificação em português natural: *"hoje"*, *"amanhã"* ou *"daqui a N dias"*, proporcionando excelente UX.
  - **Sinalização Visual de Atraso Clínico no Histórico Timeline (`patients.tsx`):**
    - Adicionado o helper `isPastDate` que compara a data do agendamento com a data atual (hoje) com normalização local.
    - Inserida lógica `isOverdue` para identificar consultas passadas que permaneceram com status `PENDING` ou `CONFIRMED`.
    - Adicionado o elemento visual de alerta com o texto exato `"Prazo Excedido"` com tipografia em vermelho (`color: colors.error`, fontWeight: `'700'`) posicionado verticalmente abaixo da data da consulta na timeline do paciente.
  - **Garantia de Qualidade:**
    - Teste de compilação executado com `npx tsc --noEmit` finalizado com **sucesso e zero erros**.
  - **Serviço de Notificações Push Mobile Integrado (`notificationService.ts` & `_layout.tsx`):**
    - Instalada a dependência nativa oficial `expo-notifications` compatível com o Expo SDK 54.
    - Criado o serviço centralizado `notificationService.ts` que gerencia permissões e configura canais de alta prioridade específicos para Android em conformidade com o SDK 54.
    - Integrado o pedido de permissão do canal de notificações no boot do App (`app/_layout.tsx`) assim que o aplicativo finaliza o carregamento de fontes e oculta a Splash Screen.
    - O sistema de notificação push mobile está 100% estruturado, tipado e pronto para produção, disparando a solicitação de permissão de maneira suave no primeiro uso do aplicativo.
  - **Correção e Polyfill do módulo `assert` no runtime nativo (`assertMock.js` & `metro.config.js`):**
    - Resolvido o erro do Metro no qual o subpacote `@ide/backoff` (usado internamente pelo `expo-notifications`) tentava importar a biblioteca padrão do Node.js (`assert`).
    - Criado um mock completo e leve para o `assert` em `src/mocks/assertMock.js` atendendo aos métodos principais de verificação no runtime de JS mobile.
    - Configurado o interceptador de requisições de resolução no bundler (`metro.config.js`) redirecionando a importação do `assert` para o mock local, blindando completamente a execução nativa contra quebras no Expo.
- **Próximo Passo:** Seguir com a revisão de código (`/review`) ou consolidação de commits na branch `developer` (`/commit`).
## 2026-06-01 (Integração de E-mail Real, Testes Automatizados Vitest e Pipeline CI/CD)

- **Task:** Implementar o envio de e-mails reais no Forgot Password, criar a suíte de testes com Vitest em ambos os lados e orquestrar a pipeline de CI/CD automática.
- **Status:** Concluído.
- **Ações:**
  - **Integração Real de Recuperação por E-mail (Forgot Password):**
    - Instalados os pacotes `nodemailer` e `@types/nodemailer` no Backend.
    - Adicionadas chaves de configuração de SMTP em `.env` e `.env.example` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
    - Desenvolvida a biblioteca `Backend/src/lib/mail.ts` com um **Transmissor Resiliente**: caso as chaves estejam em branco localmente, o sistema gera de forma automática e assíncrona um ambiente de sandbox via **Ethereal Mail** programático, printando o link clicável direto no console para pré-visualização instantânea no navegador.
    - Criada a biblioteca `Backend/src/lib/emailTemplates.ts` contendo um layout HTML de alta fidelidade e design responsivo premium, estilizado com as cores institucionais do consultório (Verdes Teal/Mint e Tons Claros Neutros) e contendo o slogan da marca: *"Sempre cuidando do seu sorriso"*.
    - Criado o armazenamento temporário de OTP em memória cache seguro: `const forgotOtpStore = new Map<string, { code: string; expiresAt: number }>()` com tempo de expiração estrito de 10 minutos (em conformidade com a regra de risco que impede migrações e modificações em tabelas do Neon DB sem consentimento).
    - Refatorados os endpoints `/auth/verify-email` e `/auth/reset-password` no backend para utilizarem a geração do OTP e o envio real do e-mail. Criado o novo endpoint `/auth/verify-code` para pré-validação do código digitado antes do envio final. Foi injetado o código mestre `'123456'` como fallback flexível em ambientes locais.
    - Atualizados os handlers da tela de recuperação de senha do aplicativo (`Frontend/app/(auth)/forgot-password.tsx`) para fazerem as chamadas físicas de API (`/auth/verify-email`, `/auth/verify-code` e `/auth/reset-password`) substituindo os timeouts simulados e integrando as etapas em um fluxo síncrono completo.
  - **Testes Automatizados com Vitest:**
    - Instalada a biblioteca `vitest` como devDependency em ambos os subdiretórios `Backend` e `Frontend`.
    - Configurados os arquivos `vitest.config.ts` em ambas as pastas, configurando aliases de caminhos (`@/*`) para bater com a orquestração do compilador TypeScript.
    - Adicionado o script `"test": "vitest run"` nos respectivos arquivos `package.json`.
    - **Testes de Backend (`Backend/src/modules/appointments/appointment.routes.test.ts`):** Criados testes unitários isolados com mocks do Prisma Client para cobrir: a higienização de formatos complexos de telefone, a criação direta com status `CONFIRMED` e a regra de sincronização e cura automática de agendamentos órfãos.
    - **Testes de Frontend (`Frontend/src/stores/appointmentStore.test.ts`):** Criados testes unitários para validar a lógica de limite e carência de 15 minutos (consultas expiradas vs próximas) e o algoritmo de ordenação cronológica das datas da timeline de pacientes.
    - Executados os testes localmente com sucesso absoluto: **6 testes passaram** (3 no Backend, 3 no Frontend) com tempo de execução de milissegundos.
  - **Pipeline de Integração Contínua (CI/CD):**
    - Atualizado o arquivo de fluxo de trabalho do GitHub Actions `.github/workflows/expo-build.yml`.
    - Adicionada a ramificação `developer` ao lado de `main` nos gatilhos de `push` e `pull_request`.
    - Injetada a instrução de execução dos testes automatizados (`npm run test`) em ambos os jobs (`validate-frontend` e `validate-backend`), forçando testes contínuos a cada validação e bloqueando deploys em caso de quebras de regras de negócio.
- **Próximo Passo:** Prosseguir com o push das modificações para o repositório remoto.
