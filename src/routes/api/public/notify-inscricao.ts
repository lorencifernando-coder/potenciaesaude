import { createFileRoute } from "@tanstack/react-router";

// Rota pública chamada pelo formulário após salvar uma nova inscrição.
// Envia notificação por e-mail via Resend, se a chave estiver configurada.
// Falha silenciosamente — a inscrição já foi salva no banco.

const ADMIN_EMAIL = "adm@lflcuidadoesaude.com.br";

export const Route = createFileRoute("/api/public/notify-inscricao")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { nome?: string; email?: string; telefone?: string };
          const nome = String(body.nome ?? "").slice(0, 200);
          const email = String(body.email ?? "").slice(0, 200);
          const telefone = String(body.telefone ?? "").slice(0, 30);

          const RESEND_API_KEY = process.env.RESEND_API_KEY;
          if (!RESEND_API_KEY) {
            console.log("[notify-inscricao] RESEND_API_KEY ausente — pulando notificação.");
            return new Response(JSON.stringify({ ok: true, notified: false }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Avaliação LFL <onboarding@resend.dev>",
              to: [ADMIN_EMAIL],
              subject: `Nova avaliação recebida — ${nome}`,
              html: `
                <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa">
                  <h2 style="color:#8a6e3f;font-family:Georgia,serif;font-weight:400">Nova avaliação recebida</h2>
                  <p style="color:#444">Um novo paciente preencheu o formulário de avaliação.</p>
                  <table style="width:100%;border-collapse:collapse;margin-top:16px">
                    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase">Nome</td><td style="padding:8px;border-bottom:1px solid #eee">${escape(nome)}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase">E-mail</td><td style="padding:8px;border-bottom:1px solid #eee">${escape(email)}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase">Telefone</td><td style="padding:8px;border-bottom:1px solid #eee">${escape(telefone)}</td></tr>
                  </table>
                  <p style="color:#888;font-size:12px;margin-top:24px">Acesse o painel para ver todos os dados clínicos da avaliação.</p>
                </div>
              `,
            }),
          });

          if (!resp.ok) {
            const txt = await resp.text();
            console.error("[notify-inscricao] Resend erro:", resp.status, txt);
            return new Response(JSON.stringify({ ok: false, notified: false }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ ok: true, notified: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("[notify-inscricao] erro:", e);
          return new Response(JSON.stringify({ ok: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

function escape(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
