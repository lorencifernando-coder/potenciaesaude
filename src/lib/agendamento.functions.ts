import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Slot = { iso: string; label: string; turno: "Manhã" | "Tarde" | "Noite" };

function turnoOf(hour: number): Slot["turno"] {
  if (hour < 12) return "Manhã";
  if (hour < 18) return "Tarde";
  return "Noite";
}

// Gera os próximos 5 slots de 60 min livres com base nas janelas de disponibilidade.
// Fase 1: sem freebusy do Google — apenas remove os já agendados em `agendamentos`.
export const getAvailableSlots = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ inscricaoId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: insc } = await supabaseAdmin
      .from("inscricoes")
      .select("id, payment_status")
      .eq("id", data.inscricaoId)
      .single();
    if (!insc) throw new Error("Inscrição não encontrada.");
    if (insc.payment_status !== "paid") {
      return { slots: [] as Slot[], blocked: "Aguardando confirmação do pagamento." };
    }

    const [{ data: cfg }, { data: settings }, { data: ocup }] = await Promise.all([
      supabaseAdmin.from("disponibilidade_config").select("*").eq("ativo", true),
      supabaseAdmin.from("app_settings").select("*").eq("id", 1).single(),
      supabaseAdmin
        .from("agendamentos")
        .select("data_hora")
        .gte("data_hora", new Date().toISOString())
        .eq("status", "scheduled"),
    ]);

    const dur = settings?.slot_duracao_min ?? 60;
    const ante = settings?.antecedencia_min_horas ?? 24;
    const ocupSet = new Set((ocup ?? []).map((o) => new Date(o.data_hora).toISOString()));

    const earliest = new Date(Date.now() + ante * 3600 * 1000);
    const slots: Slot[] = [];

    // Próximos 21 dias varrendo janelas configuradas
    for (let d = 0; d < 21 && slots.length < 5; d++) {
      const day = new Date();
      day.setDate(day.getDate() + d);
      day.setSeconds(0, 0);
      const dow = day.getDay();
      const janelas = (cfg ?? []).filter((c) => c.dia_semana === dow);
      for (const j of janelas) {
        const [hi, mi] = String(j.hora_inicio).split(":").map(Number);
        const [hf, mf] = String(j.hora_fim).split(":").map(Number);
        const start = new Date(day);
        start.setHours(hi, mi, 0, 0);
        const end = new Date(day);
        end.setHours(hf, mf, 0, 0);
        for (let t = new Date(start); t.getTime() + dur * 60000 <= end.getTime(); t = new Date(t.getTime() + dur * 60000)) {
          if (t < earliest) continue;
          const iso = t.toISOString();
          if (ocupSet.has(iso)) continue;
          slots.push({
            iso,
            turno: turnoOf(t.getHours()),
            label: t.toLocaleString("pt-BR", {
              weekday: "short",
              day: "2-digit",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Sao_Paulo",
            }),
          });
          if (slots.length >= 5) break;
        }
        if (slots.length >= 5) break;
      }
    }

    return { slots, blocked: null as string | null };
  });

async function sendConfirmEmail(opts: { to: string; nome: string; dataHora: string; meetLink?: string | null }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return;
  const ADMIN = "adm@lflcuidadoesaude.com.br";
  const when = new Date(opts.dataHora).toLocaleString("pt-BR", {
    dateStyle: "full", timeStyle: "short", timeZone: "America/Sao_Paulo",
  });
  const meetBlock = opts.meetLink
    ? `<p>Link Google Meet: <a href="${opts.meetLink}">${opts.meetLink}</a></p>`
    : `<p style="color:#8a6e3f">O link do Google Meet será enviado em breve.</p>`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa">
      <h2 style="color:#8a6e3f;font-family:Georgia,serif;font-weight:400">Avaliação confirmada</h2>
      <p>Olá ${opts.nome.split(" ")[0]}, sua avaliação com o Dr. Luiz Fernando Lorenci está confirmada para:</p>
      <p style="font-size:18px;color:#222"><strong>${when}</strong></p>
      ${meetBlock}
      <p style="color:#666;font-size:13px;margin-top:24px">Em caso de necessidade de reagendamento, responda este e-mail ou entre em contato pelo WhatsApp (49) 99931-8583.</p>
    </div>`;

  for (const to of [opts.to, ADMIN]) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "Dr. Lorenci <onboarding@resend.dev>",
          to: [to],
          subject: to === ADMIN ? `Nova consulta agendada — ${opts.nome}` : "Sua avaliação está confirmada",
          html,
        }),
      });
    } catch (e) { console.error("[email] falhou", e); }
  }
}

export const confirmarAgendamento = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    inscricaoId: z.string().uuid(),
    slotIso: z.string().datetime(),
  }).parse(input))
  .handler(async ({ data }) => {
    const { data: insc, error } = await supabaseAdmin
      .from("inscricoes")
      .select("id, nome, email, payment_status")
      .eq("id", data.inscricaoId)
      .single();
    if (error || !insc) throw new Error("Inscrição não encontrada.");
    if (insc.payment_status !== "paid") throw new Error("Pagamento não confirmado.");

    // Verificar conflito
    const { data: conflito } = await supabaseAdmin
      .from("agendamentos")
      .select("id")
      .eq("data_hora", data.slotIso)
      .eq("status", "scheduled")
      .maybeSingle();
    if (conflito) throw new Error("Horário acabou de ser ocupado. Escolha outro.");

    // TODO Fase 2: criar evento Google Calendar com Meet aqui.
    const { data: ag, error: agErr } = await supabaseAdmin
      .from("agendamentos")
      .insert({ inscricao_id: insc.id, data_hora: data.slotIso })
      .select("id, data_hora, google_meet_link")
      .single();
    if (agErr || !ag) throw new Error("Falha ao registrar agendamento.");

    await sendConfirmEmail({
      to: insc.email,
      nome: insc.nome,
      dataHora: ag.data_hora,
      meetLink: ag.google_meet_link,
    });

    return { id: ag.id, dataHora: ag.data_hora };
  });
