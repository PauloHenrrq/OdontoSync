# ODONTOSYNC — Roadmap & TODO

## Fase 1: Interface e Mock (Design First)
- [x] Inicializar projeto React Native com Expo e pnpm.
- [x] Configurar TypeScript Strict, Eslint, Prettier e Alias de Paths.
- [x] Configurar roteamento condicional RBAC com Expo Router.
- [x] Criar Mock Data (Zod/JSON) para Usuários, Agendamentos, Clínicas e Notificações.
- [x] Implementar UI e fluxo de Login/Cadastro no Frontend (via Mocks).
- [x] Implementar UI da Agenda do Dia da Recepcionista (Admin).
- [x] Implementar UI de Minhas Consultas do Paciente (Client).

## Fase 2: Interface, UX e Blindagem Local
- [x] Tela de Agenda do Dia com Listagem dinâmica por filtros.
- [x] Perfil do Paciente e Dashboard de Próximas Consultas.
- [x] Atalho WhatsApp integrado para Pacientes sem conta (disparo manual).
- [x] Desacoplamento arquitetural (SOLID) das Zustand Stores para Services dedicados.

## Fase 3: Integração Backend & Banco de Dados (Atual)
- [x] Configuração do arquivo `.env` no `/backend` com string de conexão Neon DB.
- [x] Execução das migrações do Prisma ORM (`npx prisma db push` / `migrate dev`).
- [x] Integração da camada Service do frontend (`AuthService`, `AppointmentService`, `ClinicService`) substituindo TODOS os mocks por chamadas de API reais.
- [x] Testes ponta a ponta e validação do fluxo do "Elo Central" (telefone como identificador universal).
- [x] Sincronização e seed do banco real com pacientes e serviços reais.

## Fase 4: Polimento UX e Recursos Avançados
- [x] Componentes Nativos vs Web: Refatoração de Pickers para Dropdowns customizados e animados.
- [x] Melhoria nas Máscaras de Input (evitar bloqueios de backspace).
- [ ] Criação/Refinamento do Modal de Templates de Contato WhatsApp para Pacientes.
- [ ] Refinamento da visualização e obrigatoriedade dos campos de Agendamento.
- [ ] Prontuário Digital.
- [ ] Módulo Financeiro e Repasses.
- [ ] Gestão de Estoque e Clínicas Parceiras.

