import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListInscricoes, adminGetDisponibilidade, adminSetDisponibilidade,
  adminGetSettings, adminUpdateSettings, checkIsAdmin,
} from "@/lib/admin.functions";
import { Loader2, LogOut, Settings as SettingsIcon, Calendar as CalIcon, Users, Save, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrador — LFL Saúde" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TURNOS = [
  { label: "Manhã", inicio: "08:00:00", fim: "12:00:00" },
  { label: "Tarde", inicio: "14:00:00", fim: "18:00:00" },
  { label: "Noite", inicio: "19:00:00", fim: "22:00:00" },
];

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"inscricoes" | "disponibilidade" | "config">("inscricoes");
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  const checkAdmin = useServerFn(checkIsAdmin);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate({ to: "/login" }); return; }
      try {
        const r = await checkAdmin();
        if (ignore) return;
        if (!r.isAdmin) {
          await supabase.auth.signOut();
          navigate({ to: "/login" });
          return;
        }
        setAuthed(true);
      } catch {
        navigate({ to: "/login" });
      } finally { setReady(true); }
    })();
    return () => { ignore = true; };
  }, [navigate, checkAdmin]);

  if (!ready || !authed) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-gold" /></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <div className="font-serif text-gold-l">Painel Administrativo</div>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <LogOut size={14} /> Sair
          </button>
        </div>
        <div className="mx-auto max-w-6xl px-5 flex gap-1 -mb-px">
          {[
            { id: "inscricoes" as const, label: "Inscrições", icon: Users },
            { id: "disponibilidade" as const, label: "Disponibilidade", icon: CalIcon },
            { id: "config" as const, label: "Configurações", icon: SettingsIcon },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm flex items-center gap-1.5 border-b-2 transition-colors ${tab === t.id ? "border-gold text-gold-l" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "inscricoes" && <TabInscricoes />}
        {tab === "disponibilidade" && <TabDisponibilidade />}
        {tab === "config" && <TabConfig />}
      </main>
    </div>
  );
}

function TabInscricoes() {
  const fn = useServerFn(adminListInscricoes);
  const { data, isLoading } = useQuery({ queryKey: ["admin-inscricoes"], queryFn: () => fn() });
  if (isLoading) return <Loader2 className="animate-spin text-gold" />;
  const rows = data?.rows ?? [];
  return (
    <div>
      <h2 className="font-serif text-2xl text-cream mb-4">Inscrições ({rows.length})</h2>
      <div className="border border-border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Paciente</th>
              <th className="text-left p-3">Contato</th>
              <th className="text-left p-3">Pagamento</th>
              <th className="text-left p-3">Consulta</th>
              <th className="text-left p-3">Objetivo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const ag = Array.isArray(r.agendamentos) ? r.agendamentos[0] : null;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-ink2/30">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-cream">{r.nome}</td>
                  <td className="p-3 text-muted-foreground">
                    <div>{r.email}</div>
                    <div className="text-xs">{r.telefone}</div>
                  </td>
                  <td className="p-3">
                    <PaymentBadge status={r.payment_status} />
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {ag ? (
                      <div>
                        <div className="text-cream">{new Date(ag.data_hora).toLocaleString("pt-BR")}</div>
                        {ag.google_meet_link && <a className="text-xs text-gold-l" href={ag.google_meet_link}>Meet</a>}
                      </div>
                    ) : <span className="text-xs">—</span>}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{r.objetivo ?? "—"}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">Nenhuma inscrição ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string }> = {
    paid: { c: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", l: "Pago" },
    pending: { c: "bg-amber-500/10 text-amber-400 border-amber-500/30", l: "Pendente" },
    failed: { c: "bg-red-500/15 text-red-400 border-red-500/30", l: "Falhou" },
    cancelled: { c: "bg-muted text-muted-foreground border-border", l: "Cancelado" },
  };
  const m = map[status] ?? { c: "bg-muted text-muted-foreground border-border", l: status };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${m.c}`}>{m.l}</span>;
}

function TabDisponibilidade() {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetDisponibilidade);
  const setFn = useServerFn(adminSetDisponibilidade);
  const { data, isLoading } = useQuery({ queryKey: ["admin-disp"], queryFn: () => getFn() });
  const [grid, setGrid] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!data) return;
    const g: Record<string, boolean> = {};
    for (const r of data.rows) {
      g[`${r.dia_semana}-${r.hora_inicio}`] = !!r.ativo;
    }
    setGrid(g);
  }, [data]);

  const mut = useMutation({
    mutationFn: async () => {
      const items: { dia_semana: number; hora_inicio: string; hora_fim: string; ativo: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        for (const t of TURNOS) {
          if (grid[`${d}-${t.inicio}`]) {
            items.push({ dia_semana: d, hora_inicio: t.inicio, hora_fim: t.fim, ativo: true });
          }
        }
      }
      await setFn({ data: { items } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-disp"] }),
  });

  if (isLoading) return <Loader2 className="animate-spin text-gold" />;

  return (
    <div>
      <h2 className="font-serif text-2xl text-cream mb-1">Disponibilidade semanal</h2>
      <p className="text-sm text-muted-foreground mb-6">Marque os turnos em que você atende. Slots de 60 min são gerados dentro dessas janelas.</p>
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Dia</th>
              {TURNOS.map(t => <th key={t.label} className="p-3 text-center">{t.label}<div className="text-[9px] opacity-60 normal-case">{t.inicio.slice(0,5)} – {t.fim.slice(0,5)}</div></th>)}
            </tr>
          </thead>
          <tbody>
            {DIAS.map((d, i) => (
              <tr key={d} className="border-t border-border">
                <td className="p-3 text-cream">{d}</td>
                {TURNOS.map(t => {
                  const k = `${i}-${t.inicio}`;
                  const on = !!grid[k];
                  return (
                    <td key={t.label} className="p-3 text-center">
                      <button onClick={() => setGrid(g => ({ ...g, [k]: !g[k] }))} className={`h-8 w-8 rounded border flex items-center justify-center transition-all ${on ? "bg-gold border-gold text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-gold-line"}`}>
                        {on ? <Check size={14} /> : <X size={14} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => mut.mutate()} disabled={mut.isPending} className="mt-5 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Salvar disponibilidade
      </button>
      {mut.isSuccess && <span className="ml-3 text-xs text-emerald-400">Salvo.</span>}
    </div>
  );
}

function TabConfig() {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetSettings);
  const updFn = useServerFn(adminUpdateSettings);
  const { data, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: () => getFn() });
  const [form, setForm] = useState({ slot_duracao_min: 60, antecedencia_min_horas: 24, consulta_valor: 99 });

  useEffect(() => {
    if (data?.settings) setForm({
      slot_duracao_min: data.settings.slot_duracao_min,
      antecedencia_min_horas: data.settings.antecedencia_min_horas,
      consulta_valor: Number(data.settings.consulta_valor),
    });
  }, [data]);

  const mut = useMutation({
    mutationFn: () => updFn({ data: form }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  if (isLoading) return <Loader2 className="animate-spin text-gold" />;

  return (
    <div className="max-w-md">
      <h2 className="font-serif text-2xl text-cream mb-1">Configurações gerais</h2>
      <p className="text-sm text-muted-foreground mb-6">Ajustes globais do agendamento e pagamento.</p>
      <div className="space-y-4">
        <Field label="Duração do slot (min)">
          <input type="number" className="fi" value={form.slot_duracao_min} onChange={e => setForm({ ...form, slot_duracao_min: Number(e.target.value) })} />
        </Field>
        <Field label="Antecedência mínima (horas)">
          <input type="number" className="fi" value={form.antecedencia_min_horas} onChange={e => setForm({ ...form, antecedencia_min_horas: Number(e.target.value) })} />
        </Field>
        <Field label="Valor da consulta (R$)">
          <input type="number" step="0.01" className="fi" value={form.consulta_valor} onChange={e => setForm({ ...form, consulta_valor: Number(e.target.value) })} />
        </Field>
        <div className="border-t border-border pt-4 mt-6">
          <h3 className="text-sm font-medium text-cream mb-2">Google Calendar</h3>
          <p className="text-xs text-muted-foreground">A conexão com o Google Calendar (com criação automática de Google Meet) será habilitada após o envio das credenciais OAuth. Hoje, agendamentos são salvos no banco e o paciente recebe e-mail de confirmação.</p>
        </div>
        <button onClick={() => mut.mutate()} disabled={mut.isPending} className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salvar
        </button>
        {mut.isSuccess && <span className="ml-3 text-xs text-emerald-400">Salvo.</span>}
      </div>
      <style>{`.fi{background:var(--ink2);border:1px solid var(--border);border-radius:4px;padding:.55rem .8rem;color:var(--foreground);width:100%;font-size:13px}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}
