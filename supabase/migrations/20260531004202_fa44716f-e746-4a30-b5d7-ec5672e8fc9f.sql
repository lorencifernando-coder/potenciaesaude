
CREATE TABLE public.inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_nascimento DATE,
  cpf TEXT,
  sexo TEXT,
  peso NUMERIC,
  altura NUMERIC,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  queixas TEXT[],
  clinicas JSONB,
  matinal TEXT,
  habitos TEXT[],
  comorbidades TEXT[],
  pde5 TEXT,
  objetivo TEXT,
  notificado BOOLEAN NOT NULL DEFAULT false
);

GRANT INSERT ON public.inscricoes TO anon;
GRANT INSERT ON public.inscricoes TO authenticated;
GRANT ALL ON public.inscricoes TO service_role;

ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer visitante (anônimo) envie uma nova inscrição
CREATE POLICY "Qualquer pessoa pode criar inscrição"
ON public.inscricoes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
