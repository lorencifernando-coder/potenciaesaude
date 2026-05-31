
-- 1) site_settings (singleton id=1)
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),

  -- Marca
  empresa_nome TEXT NOT NULL DEFAULT 'LFL Cuidado e Saúde',
  empresa_slogan TEXT DEFAULT 'Saúde Sexual Masculina com Sigilo e Ciência',
  empresa_descricao TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  foto_principal_url TEXT,
  medico_nome TEXT NOT NULL DEFAULT 'Dr. Luiz Fernando Lorenci',
  crm TEXT NOT NULL DEFAULT 'CRM-SC 41096',
  especialidade TEXT DEFAULT 'Saúde Sexual Masculina',

  -- Contato
  telefone TEXT DEFAULT '(49) 99931-8583',
  whatsapp TEXT DEFAULT '5549999318583',
  email_contato TEXT DEFAULT 'adm@lflcuidadoesaude.com.br',

  -- Endereço
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,

  -- Mídia
  video_youtube_url TEXT,

  -- Header/Footer
  header_cta_texto TEXT DEFAULT 'Agendar Avaliação',
  header_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  footer_texto TEXT,
  footer_aviso_legal TEXT DEFAULT 'Atendimento Sigiloso e Humanizado.',
  footer_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  redes_sociais JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Mercado Pago (somente campos públicos)
  mp_public_key TEXT,

  -- Google Calendar
  gcal_calendar_id TEXT DEFAULT 'primary',
  gcal_calendar_link_publico TEXT,
  gcal_ics_url TEXT,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem site_settings"
ON public.site_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam site_settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins inserem site_settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed singleton
INSERT INTO public.site_settings (id) VALUES (1);

-- 2) Storage bucket público para assets do site
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true);

CREATE POLICY "Site assets leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins fazem upload de site assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam site assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins removem site assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));
