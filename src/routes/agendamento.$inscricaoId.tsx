import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAvailableSlots, confirmarAgendamento } from "@/lib/agendamento.functions";
import { createPaymentPreference } from "@/lib/payment.functions";
import { Loader2, Calendar, Lock, Sunrise, Sun, Moon, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/agendamento/$inscricaoId")({
  head: () => ({ meta: [{ title: "Escolha o horário da sua avaliação" }, { name: "robots", content: "noindex" }] }),
  component: AgendaPage,
});

function AgendaPage() {
  const { inscricaoId } = useParams({ from: "/agendamento/$inscricaoId" });
  const navigate = useNavigate();
  const slotsFn = useServerFn(getAvailableSlots);
  const confirmFn = useServerFn(confirmarAgendamento);
  const payFn = useServerFn(createPaymentPreference);
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["slots", inscricaoId],
    queryFn: () => slotsFn({ data: { inscricaoId } }),
    refetchInterval: (q) => (q.state.data?.blocked ? 4000 : false),
  });

  const mut = useMutation({
    mutationFn: (iso: string) => confirmFn({ data: { inscricaoId, slotIso: iso } }),
    onSuccess: () => navigate({ to: "/agendamento/sucesso", search: { i: inscricaoId } }),
  });

  async function payNow() {
    const r = await payFn({ data: { inscricaoId } });
    if (r.alreadyPaid) refetch();
    else window.location.href = r.init_point;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <div className="text-[10px] tracking-widest uppercase text-gold mb-3">Agendamento</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-cream mb-3 leading-tight">Escolha o melhor <em>horário</em></h1>
        <p className="text-muted-foreground mb-8">Sua avaliação de 60 minutos com o Dr. Luiz Fernando Lorenci.</p>

        {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" /> Carregando horários…</div>}

        {data?.blocked && (
          <div className="border border-amber-500/30 bg-amber-500/5 rounded-md p-6">
            <div className="flex items-start gap-3">
              <Lock className="text-amber-400 mt-0.5" size={18} />
              <div className="flex-1">
                <div className="font-medium text-amber-400 mb-1">Pagamento ainda não confirmado</div>
                <p className="text-sm text-muted-foreground mb-4">{data.blocked}</p>
                <button onClick={payNow} className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Pagar agora (R$ 99) <ArrowRight size={14} />
                </button>
                <p className="text-xs text-muted-foreground mt-3">Já pagou? Aguarde alguns segundos — a página atualiza sozinha.</p>
              </div>
            </div>
          </div>
        )}

        {data && !data.blocked && data.slots.length === 0 && (
          <div className="border border-border rounded-md p-6 text-muted-foreground">
            Nenhum horário disponível no momento. Entre em contato: (49) 99931-8583.
          </div>
        )}

        {data && data.slots.length > 0 && (
          <div className="space-y-2">
            {data.slots.map((s) => {
              const isSel = selected === s.iso;
              const Icon = s.turno === "Manhã" ? Sunrise : s.turno === "Tarde" ? Sun : Moon;
              return (
                <button key={s.iso} onClick={() => setSelected(s.iso)} className={`w-full flex items-center gap-4 rounded-md border px-5 py-4 text-left transition-all ${isSel ? "border-gold bg-gold-dim" : "border-border bg-ink2 hover:border-gold-line"}`}>
                  <Icon className={isSel ? "text-gold" : "text-muted-foreground"} size={18} />
                  <div className="flex-1">
                    <div className="text-cream capitalize">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.turno} · 60 minutos</div>
                  </div>
                  {isSel && <Calendar className="text-gold" size={16} />}
                </button>
              );
            })}
            <button disabled={!selected || mut.isPending} onClick={() => selected && mut.mutate(selected)} className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {mut.isPending ? <><Loader2 size={14} className="animate-spin" /> Confirmando…</> : <>Confirmar agendamento <ArrowRight size={14} /></>}
            </button>
            {mut.error && <p className="text-sm text-destructive mt-2">{(mut.error as Error).message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
