import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Webhook do Mercado Pago. Consulta a API com nosso token para validar o status real
// e nunca confia apenas no corpo recebido.
export const Route = createFileRoute("/api/public/mp-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!token) return new Response("MP not configured", { status: 500 });

        let payload: unknown = null;
        try { payload = await request.json(); } catch { /* ignore */ }
        const url = new URL(request.url);
        const topic = url.searchParams.get("topic") || url.searchParams.get("type");
        const idParam = url.searchParams.get("id") || url.searchParams.get("data.id");

        const p = (payload as Record<string, unknown>) || {};
        const data = (p.data as Record<string, unknown>) || {};
        const paymentId = String(data.id ?? idParam ?? "");
        const type = String(p.type ?? topic ?? "");

        if (type !== "payment" || !paymentId) {
          return new Response("ignored", { status: 200 });
        }

        const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) {
          console.error("[mp-webhook] consulta MP falhou", r.status);
          return new Response("mp lookup failed", { status: 200 });
        }
        const pay = await r.json();
        const inscricaoId = String(pay.external_reference || "");
        const status = String(pay.status || "");
        if (!inscricaoId) return new Response("no ref", { status: 200 });

        const map: Record<string, string> = {
          approved: "paid",
          rejected: "failed",
          cancelled: "cancelled",
          refunded: "refunded",
          in_process: "pending",
          pending: "pending",
        };
        const newStatus = map[status] ?? "pending";

        await supabaseAdmin
          .from("inscricoes")
          .update({ payment_status: newStatus, payment_id: String(pay.id) })
          .eq("id", inscricaoId);

        return new Response("ok", { status: 200 });
      },
      GET: async () => new Response("ok"),
    },
  },
});
