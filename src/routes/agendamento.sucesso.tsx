import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/agendamento/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({ i: typeof s.i === "string" ? s.i : "" }),
  head: () => ({ meta: [{ title: "Avaliação confirmada — LFL Saúde" }, { name: "robots", content: "noindex" }] }),
  component: SucessoPage,
});

function SucessoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-gold-dim border border-gold-line flex items-center justify-center mb-6">
          <Check className="text-gold" size={32} />
        </div>
        <h1 className="font-serif text-3xl text-cream mb-3">Tudo certo</h1>
        <p className="text-muted-foreground mb-2">Sua avaliação está confirmada.</p>
        <p className="text-muted-foreground mb-8 text-sm">Você receberá um e-mail com o horário e, em breve, o link da consulta por Google Meet.</p>
        <a href="https://wa.me/5549999318583" className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
          <MessageCircle size={14} /> Fale com a secretária
        </a>
        <div className="mt-6">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
