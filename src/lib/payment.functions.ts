import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SiteURLs = () => {
  // Resolve URL pública a partir do request seria ideal; usamos VITE_ ou hardcoded fallback.
  const base = process.env.PUBLIC_SITE_URL || "https://project--989e3d8d-d044-489d-a11f-4c6565f3a93d.lovable.app";
  return {
    success: `${base}/agendamento/sucesso`,
    pending: `${base}/agendamento/sucesso`,
    failure: `${base}/agendamento/falha`,
    notify: `${base}/api/public/mp-webhook`,
  };
};

export const createPaymentPreference = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ inscricaoId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("Mercado Pago não configurado.");

    const { data: insc, error } = await supabaseAdmin
      .from("inscricoes")
      .select("id, nome, email, payment_amount, payment_status")
      .eq("id", data.inscricaoId)
      .single();
    if (error || !insc) throw new Error("Inscrição não encontrada.");

    if (insc.payment_status === "paid") {
      return { init_point: `/agendamento/${insc.id}`, alreadyPaid: true };
    }

    const urls = SiteURLs();
    const body = {
      items: [
        {
          id: insc.id,
          title: "Avaliação Médica — Dr. Luiz Fernando Lorenci",
          description: "Consulta de avaliação para saúde sexual masculina (60 min)",
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(insc.payment_amount ?? 99),
        },
      ],
      payer: { name: insc.nome, email: insc.email },
      external_reference: insc.id,
      back_urls: {
        success: `${urls.success}?inscricao=${insc.id}`,
        pending: `${urls.pending}?inscricao=${insc.id}`,
        failure: `${urls.failure}?inscricao=${insc.id}`,
      },
      auto_return: "approved",
      notification_url: urls.notify,
      statement_descriptor: "LFL SAUDE",
    };

    const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await resp.json();
    if (!resp.ok) {
      console.error("[MP] erro criar preference:", resp.status, json);
      throw new Error(`Falha ao criar pagamento: ${json.message ?? resp.status}`);
    }

    await supabaseAdmin
      .from("inscricoes")
      .update({ payment_id: json.id, payment_link: json.init_point })
      .eq("id", insc.id);

    return { init_point: json.init_point as string, alreadyPaid: false };
  });
