import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Campos seguros expostos publicamente (sem tokens/secrets)
const PUBLIC_FIELDS = [
  "empresa_nome","empresa_slogan","empresa_descricao",
  "logo_url","favicon_url","foto_principal_url",
  "medico_nome","crm","especialidade",
  "telefone","whatsapp","email_contato",
  "cep","logradouro","numero","complemento","bairro","cidade","estado",
  "video_youtube_url",
  "header_cta_texto","header_links",
  "footer_texto","footer_aviso_legal","footer_links","redes_sociais",
  "mp_public_key",
  "gcal_calendar_link_publico",
].join(",");

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Acesso negado.");
}

export const getPublicSiteSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const [{ data: site }, { data: app }] = await Promise.all([
      supabaseAdmin.from("site_settings").select(PUBLIC_FIELDS).eq("id", 1).maybeSingle(),
      supabaseAdmin.from("app_settings").select("consulta_valor").eq("id", 1).maybeSingle(),
    ]);
    const base = (site as Record<string, unknown> | null) ?? {};
    return { settings: { ...base, consulta_valor: Number(app?.consulta_valor ?? 99) } };
  });

export const adminGetSiteSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("site_settings").select("*").eq("id", 1).maybeSingle();
    // Indica se os tokens secretos estão configurados (sem expor o valor)
    const mpConfigured = !!process.env.MERCADOPAGO_ACCESS_TOKEN;
    const gcalConfigured = !!process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    return { settings: data, mpConfigured, gcalConfigured };
  });

const updateSchema = z.object({
  empresa_nome: z.string().optional(),
  empresa_slogan: z.string().optional().nullable(),
  empresa_descricao: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  favicon_url: z.string().optional().nullable(),
  foto_principal_url: z.string().optional().nullable(),
  medico_nome: z.string().optional(),
  crm: z.string().optional(),
  especialidade: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email_contato: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  logradouro: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  video_youtube_url: z.string().optional().nullable(),
  header_cta_texto: z.string().optional().nullable(),
  header_links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  footer_texto: z.string().optional().nullable(),
  footer_aviso_legal: z.string().optional().nullable(),
  footer_links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  redes_sociais: z.record(z.string(), z.string()).optional(),
  mp_public_key: z.string().optional().nullable(),
  gcal_calendar_id: z.string().optional().nullable(),
  gcal_calendar_link_publico: z.string().optional().nullable(),
  gcal_ics_url: z.string().optional().nullable(),
}).partial();

export const adminUpdateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("site_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });
