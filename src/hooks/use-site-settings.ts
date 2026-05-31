import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSiteSettings } from "@/lib/site-settings.functions";

export type PublicSiteSettings = {
  empresa_nome: string;
  empresa_slogan: string | null;
  empresa_descricao: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  foto_principal_url: string | null;
  medico_nome: string;
  crm: string;
  especialidade: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email_contato: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  video_youtube_url: string | null;
  header_cta_texto: string | null;
  header_links: Array<{ label: string; href: string }>;
  footer_texto: string | null;
  footer_aviso_legal: string | null;
  footer_links: Array<{ label: string; href: string }>;
  redes_sociais: Record<string, string>;
  mp_public_key: string | null;
  gcal_calendar_link_publico: string | null;
};

export function useSiteSettings() {
  const fn = useServerFn(getPublicSiteSettings);
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => (await fn()).settings as PublicSiteSettings | null,
    staleTime: 5 * 60 * 1000,
  });
}

export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  const id = m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(url) ? url : null);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
