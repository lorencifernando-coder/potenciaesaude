import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas administrador.");
}

export const adminListInscricoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("inscricoes")
      .select("*, agendamentos(id, data_hora, google_meet_link, status)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return { rows: data ?? [] };
  });

export const adminGetDisponibilidade = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("disponibilidade_config")
      .select("*")
      .order("dia_semana")
      .order("hora_inicio");
    return { rows: data ?? [] };
  });

export const adminSetDisponibilidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    items: z.array(z.object({
      dia_semana: z.number().int().min(0).max(6),
      hora_inicio: z.string(),
      hora_fim: z.string(),
      ativo: z.boolean(),
    })),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    await supabaseAdmin.from("disponibilidade_config").delete().gte("dia_semana", 0);
    if (data.items.length) {
      const { error } = await supabaseAdmin.from("disponibilidade_config").insert(data.items);
      if (error) throw error;
    }
    return { ok: true };
  });

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data } = await supabaseAdmin.from("app_settings").select("*").eq("id", 1).single();
    return { settings: data };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    google_calendar_id: z.string().optional(),
    slot_duracao_min: z.number().int().min(15).max(240).optional(),
    antecedencia_min_horas: z.number().int().min(0).max(168).optional(),
    consulta_valor: z.number().min(0).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("app_settings").update({
      ...data, updated_at: new Date().toISOString(),
    }).eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });
