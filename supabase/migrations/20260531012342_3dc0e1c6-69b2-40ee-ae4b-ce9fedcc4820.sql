
-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users see their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. Estender inscricoes
ALTER TABLE public.inscricoes
  ADD COLUMN payment_id TEXT,
  ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN payment_amount NUMERIC(10,2) NOT NULL DEFAULT 99.00,
  ADD COLUMN payment_link TEXT;

-- Admin pode ver/atualizar todas inscricoes
CREATE POLICY "Admins veem todas inscricoes" ON public.inscricoes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam inscricoes" ON public.inscricoes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Agendamentos
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_id UUID NOT NULL REFERENCES public.inscricoes(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_min INT NOT NULL DEFAULT 60,
  google_event_id TEXT,
  google_meet_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agendamentos TO authenticated;
GRANT ALL ON public.agendamentos TO service_role;

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem agendamentos" ON public.agendamentos
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Leitura pública por id (para a página do paciente após agendar) - feita via server fn admin
-- Insert/update apenas via service_role

CREATE INDEX idx_agendamentos_data_hora ON public.agendamentos(data_hora);
CREATE INDEX idx_agendamentos_inscricao ON public.agendamentos(inscricao_id);

-- 4. Disponibilidade (janelas semanais)
CREATE TABLE public.disponibilidade_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.disponibilidade_config TO anon, authenticated;
GRANT ALL ON public.disponibilidade_config TO service_role;

ALTER TABLE public.disponibilidade_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Disponibilidade pública leitura" ON public.disponibilidade_config
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins gerenciam disponibilidade" ON public.disponibilidade_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. App settings (singleton)
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  google_refresh_token TEXT,
  google_calendar_id TEXT DEFAULT 'primary',
  slot_duracao_min INT NOT NULL DEFAULT 60,
  antecedencia_min_horas INT NOT NULL DEFAULT 24,
  consulta_valor NUMERIC(10,2) NOT NULL DEFAULT 99.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (id) VALUES (1);

GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem settings" ON public.app_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Seed disponibilidade padrão (Seg-Sex Manhã/Tarde)
INSERT INTO public.disponibilidade_config (dia_semana, hora_inicio, hora_fim, ativo) VALUES
  (1, '08:00', '12:00', true),
  (1, '14:00', '18:00', true),
  (2, '08:00', '12:00', true),
  (2, '14:00', '18:00', true),
  (3, '08:00', '12:00', true),
  (3, '14:00', '18:00', true),
  (4, '08:00', '12:00', true),
  (4, '14:00', '18:00', true),
  (5, '08:00', '12:00', true),
  (5, '14:00', '18:00', true);
