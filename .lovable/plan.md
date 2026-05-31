## Visão geral

Estender o fluxo atual (questionário → inscrição) com:
1. **Pagamento Pix/cartão** via Mercado Pago Checkout Pro com webhook de confirmação.
2. **5 slots de horário** gerados a partir de janelas configuráveis no painel admin, descontando o que já está ocupado na Google Calendar do Dr. Lorenci.
3. **Painel admin** (rota protegida `/admin`) para: login, configurar janelas semanais (turnos manhã/tarde/noite por dia da semana), conectar Google Calendar, ver inscrições e status de pagamento.
4. **Agendamento confirmado** cria evento na Google Calendar com link Google Meet automático e dispara email de confirmação para paciente e médico via Resend.

## Fluxo do paciente

```text
Questionário (já existe)
   ↓ salva em `inscricoes`
Checkout Mercado Pago (Pix/cartão)
   ↓ webhook /api/public/mp-webhook marca payment_status='paid'
Página /agendamento/:inscricaoId
   → mostra 5 próximos slots livres
   → paciente escolhe
   ↓ server fn cria evento Google Calendar + Meet
Página de sucesso + email confirmação
```

## Banco de dados (nova migration)

- `inscricoes`: novas colunas `payment_id`, `payment_status` (pending/paid/cancelled), `payment_amount`, `agendamento_id`.
- `agendamentos`: `id`, `inscricao_id` (FK), `data_hora` (timestamptz), `google_event_id`, `google_meet_link`, `status` (scheduled/cancelled), `created_at`.
- `disponibilidade_config`: `id`, `dia_semana` (0-6), `hora_inicio`, `hora_fim`, `ativo` — janelas que o admin define.
- `app_settings` (singleton): `id`, `google_refresh_token` (criptografado server-side), `google_calendar_id`, `slot_duracao_min` (default 60), `antecedencia_min_horas` (default 24).
- `user_roles` + função `has_role` para gating do `/admin` (admin único: Dr. Lorenci).

RLS: pacientes só inserem `inscricoes` (já feito). `agendamentos` só admin lê; insert via server fn com service role. `disponibilidade_config` leitura pública (para gerar slots no front), write só admin.

## Painel admin

Rota `/admin` protegida por `_authenticated` + checagem `has_role('admin')`.

- **Login**: email/senha + Google (Dr. Lorenci se cadastra uma vez).
- **Aba Agenda Google**: botão "Conectar Google Calendar" → OAuth com escopos `calendar.events`. Token de refresh salvo em `app_settings`. Permite escolher qual `calendar_id` usar.
- **Aba Disponibilidade**: tabela editável dia × turno (Manhã 8-12, Tarde 13-18, Noite 19-22). Toggle por slot.
- **Aba Inscrições**: lista todas as `inscricoes` com filtros, status de pagamento, agendamento, link Meet, dados clínicos do questionário (modal).

## Integração Mercado Pago

- Server fn `createPaymentPreference` (chamada após submit do questionário): cria Preference via API MP REST, retorna `init_point`. Frontend redireciona.
- Server route público `/api/public/mp-webhook`: recebe IPN, valida com MP API, atualiza `inscricoes.payment_status`. Após `paid`, redireciona paciente para `/agendamento/:id`.
- Secret necessário: `MERCADOPAGO_ACCESS_TOKEN` (vou pedir após aprovação do plano).

## Integração Google Calendar

Lovable tem conector Google Calendar mas é por gateway compartilhado da conta do desenvolvedor — não serve aqui porque cada Dr. Lorenci precisa conectar a *sua* agenda. Vou implementar **OAuth 2.0 próprio**:

- Credenciais OAuth do Google Cloud (Client ID + Secret) ficam como secrets `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`.
- Rota `/api/public/google-oauth-callback` recebe code, troca por refresh token, salva em `app_settings`.
- Server fn `getAvailableSlots(inscricaoId)`: lê `disponibilidade_config`, gera próximas datas dentro da janela (próximos 14 dias), chama `freebusy.query` do Google Calendar para remover horários ocupados, devolve os 5 primeiros livres.
- Server fn `confirmarAgendamento(inscricaoId, slot)`: cria evento com `conferenceData.createRequest` (gera Meet automático), persiste em `agendamentos`, dispara email.

## Email

Já existe rota `/api/public/notify-inscricao` com Resend. Adicionar:
- Email de confirmação ao paciente com data/hora, link Meet, instruções.
- Email para Dr. Lorenci com resumo + Meet.
- Adicionar lembrete (cron pg_cron 24h antes) — opcional, fica para v2.

## Detalhes técnicos

- **Server fns novas** (`src/lib/agendamento.functions.ts`, `src/lib/admin.functions.ts`, `src/lib/payment.functions.ts`).
- **Server routes novas** (`src/routes/api/public/mp-webhook.ts`, `src/routes/api/public/google-oauth-callback.ts`).
- **Rotas UI novas**: `/admin`, `/admin/google`, `/admin/disponibilidade`, `/admin/inscricoes`, `/agendamento/$inscricaoId`, `/agendamento/sucesso`, `/login`.
- Adaptar `Quiz.tsx` para, após salvar inscrição, chamar `createPaymentPreference` e redirecionar para Mercado Pago.

## Secrets que vou pedir após aprovação

1. `MERCADOPAGO_ACCESS_TOKEN` — obtido em mercadopago.com.br/developers (app do Dr.).
2. `GOOGLE_OAUTH_CLIENT_ID` e `GOOGLE_OAUTH_CLIENT_SECRET` — criados no Google Cloud Console com redirect URI `https://<projeto>.lovable.app/api/public/google-oauth-callback`.
3. `RESEND_API_KEY` — se ainda não foi configurada da etapa anterior.

## Entrega faseada

**Fase 1 (esta entrega):** estrutura de DB, login admin com role, painel admin com janelas + lista de inscrições, integração Mercado Pago (checkout + webhook), gating do agendamento por pagamento.

**Fase 2 (depois das credenciais Google):** OAuth Google Calendar, geração de slots reais, criação de evento com Meet, email de confirmação enriquecido.

Faseamento permite testar fluxo de pagamento antes mesmo de o Google estar conectado — slots iniciais vêm só das janelas (sem freebusy).