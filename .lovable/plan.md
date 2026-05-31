## Painel central de configurações do site

Adicionar uma área de configurações abrangente em `/admin` que controla **todas as páginas** (atuais e futuras) — marca, contato, header/rodapé, vídeo informativo, integrações (Mercado Pago + Google Calendar) e janelas livres de horário.

### 1. Banco — nova tabela `site_settings` (singleton, id=1)

**Identidade / Marca**
- `empresa_nome`, `empresa_slogan`, `empresa_descricao`
- `logo_url`, `favicon_url`, `foto_principal_url`
- `medico_nome`, `crm`, `especialidade`

**Contato / Endereço**
- `telefone`, `whatsapp`, `email_contato`
- `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`

**Mídia**
- `video_youtube_url`

**Cabeçalho / Rodapé**
- `header_cta_texto`, `header_links` (JSON `[{label, href}]`)
- `footer_texto`, `footer_aviso_legal`, `footer_links` (JSON)
- `redes_sociais` (JSON `{instagram, facebook, linkedin, youtube}`)

**Mercado Pago**
- `mp_public_key` (chave pública — pode ficar no banco, vai ao cliente)
- `mp_status` calculado: o token privado segue como secret `MERCADOPAGO_ACCESS_TOKEN`. O painel exibe "configurado / não configurado" e um botão **"Atualizar token Mercado Pago"** que chama `secrets--update_secret`.
- `mp_webhook_url` (somente leitura — mostra a URL do webhook para o usuário colar no painel MP)

**Google Calendar**
- `gcal_calendar_id` (texto, ex.: `primary` ou ID do calendário)
- `gcal_calendar_link_publico` (link de visualização que o admin cola)
- `gcal_ics_url` (opcional — URL ICS privado para sincronizar busy times)
- `gcal_oauth_status` calculado: status do refresh token armazenado em secret `GOOGLE_OAUTH_REFRESH_TOKEN` (Fase 2). Painel mostra **"Conectar Google Calendar"** (placeholder até credenciais OAuth) e botões para atualizar `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` via `secrets--add_secret`.

**Disponibilidade — substituir turnos fixos por janelas livres**
A tabela `disponibilidade_config` já existe. Reescrever a UI para permitir criar/editar/remover **janelas livres** por dia (inputs de hora_inicio/hora_fim), sem mais checkboxes Manhã/Tarde/Noite.

### 2. Storage — bucket público `site-assets`
Upload de logo, favicon e foto principal direto do painel (sem precisar colar URL). Policies: leitura pública; escrita só admin.

### 3. UI do painel `/admin` — abas reorganizadas
- **Inscrições** (mantém)
- **Disponibilidade** (reescrita — janelas livres editáveis)
- **Marca & Mídia** (logo, favicon, foto, vídeo YouTube, nome, slogan, descrição, médico/CRM)
- **Contato & Endereço**
- **Cabeçalho & Rodapé** (links, CTA, texto, redes sociais)
- **Pagamento (Mercado Pago)** (status token, atualizar secret, chave pública, valor da consulta, webhook URL para copiar)
- **Google Calendar** (calendar ID, link público, status OAuth, botões para configurar credenciais — UI pronta; integração real depende das credenciais)
- **Geral** (duração slot, antecedência mínima — já existe em `app_settings`)

### 4. Frontend — propagar settings para o site inteiro
- Novo server fn público `getPublicSiteSettings()` retornando **apenas** campos seguros (exclui tokens). Cacheado via TanStack Query (`staleTime` generoso, invalidado quando admin salva).
- Hook `useSiteSettings()`.
- Componentes reutilizáveis `<SiteHeader />` e `<SiteFooter />` consumindo settings — toda página nova herda automaticamente.
- `index.tsx` usa: `foto_principal_url`, `empresa_nome`, `medico_nome`, `crm`, `video_youtube_url`, contato, endereço, footer.
- `__root.tsx` injeta `favicon_url` e meta tags (title/description) a partir das settings.
- Quiz/agendamento/sucesso exibem nome, contato, WhatsApp dinâmicos.

### 5. Seed inicial
Migration popula `site_settings` com os dados atuais hardcoded (Dr. Luiz Fernando Lorenci, CRM-SC 41096, (49) 99931-8583, adm@lflcuidadoesaude.com.br, endereço em branco para o admin completar).

### Notas técnicas
- RLS: `site_settings` — SELECT público apenas via server fn (não policy aberta, para esconder campos sensíveis); UPDATE só admin.
- Token Mercado Pago **nunca** vai para o banco — fica no secret, atualizado via `update_secret`.
- YouTube: aceita URL completa ou ID; helper extrai ID e renderiza `<iframe>` embed.
- Upload: `supabase.storage.from('site-assets').upload(...)` com auth admin; URL pública salva em `site_settings`.
- Google Calendar Fase 2: campos já existem no painel; integração OAuth real (geração de Meet, freebusy) entra quando credenciais forem fornecidas. Até lá, admin pode colar `gcal_calendar_link_publico` para exibir agenda manualmente.

### Entrega
Tudo em uma fase. Após aprovação: migração + bucket + servidor + UI + refactor das páginas para consumir settings.
