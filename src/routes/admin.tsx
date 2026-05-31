import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListInscricoes, adminGetDisponibilidade, adminSetDisponibilidade,
  adminGetSettings, adminUpdateSettings, checkIsAdmin,
} from "@/lib/admin.functions";
import { adminGetSiteSettings, adminUpdateSiteSettings } from "@/lib/site-settings.functions";
import { youtubeEmbedUrl } from "@/hooks/use-site-settings";
import { Loader2, LogOut, Settings as SettingsIcon, Calendar as CalIcon, Users, Save, Check, X, Building2, Phone, LayoutTemplate, CreditCard, Plus, Trash2, Upload, Youtube, Copy } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel — LFL Saúde" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
type TabId = "inscricoes" | "disponibilidade" | "marca" | "contato" | "header" | "pagamento" | "gcal" | "geral";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("inscricoes");
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
        if (!r.isAdmin) { await supabase.auth.signOut(); navigate({ to: "/login" }); return; }
        setAuthed(true);
      } catch { navigate({ to: "/login" }); }
      finally { setReady(true); }
    })();
    return () => { ignore = true; };
  }, [navigate, checkAdmin]);

  if (!ready || !authed) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-gold" /></div>;
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "inscricoes", label: "Inscrições", icon: Users },
    { id: "disponibilidade", label: "Disponibilidade", icon: CalIcon },
    { id: "marca", label: "Marca & Mídia", icon: Building2 },
    { id: "contato", label: "Contato", icon: Phone },
    { id: "header", label: "Cabeçalho/Rodapé", icon: LayoutTemplate },
    { id: "pagamento", label: "Pagamento", icon: CreditCard },
    { id: "gcal", label: "Google Calendar", icon: CalIcon },
    { id: "geral", label: "Geral", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <div className="font-serif text-gold-l">Painel Administrativo</div>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <LogOut size={14} /> Sair
          </button>
        </div>
        <div className="mx-auto max-w-6xl px-5 flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-2.5 text-sm flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-gold text-gold-l" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "inscricoes" && <TabInscricoes />}
        {tab === "disponibilidade" && <TabDisponibilidade />}
        {tab === "marca" && <TabSiteSettings section="marca" />}
        {tab === "contato" && <TabSiteSettings section="contato" />}
        {tab === "header" && <TabSiteSettings section="header" />}
        {tab === "pagamento" && <TabSiteSettings section="pagamento" />}
        {tab === "gcal" && <TabSiteSettings section="gcal" />}
        {tab === "geral" && <TabConfig />}
      </main>
      <style>{`.fi{background:var(--ink2);border:1px solid var(--border);border-radius:4px;padding:.55rem .8rem;color:var(--foreground);width:100%;font-size:13px}.fi:focus{outline:none;border-color:var(--gold)}`}</style>
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
            <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Paciente</th><th className="text-left p-3">Contato</th><th className="text-left p-3">Pagamento</th><th className="text-left p-3">Consulta</th></tr>
          </thead>
          <tbody>
            {rows.map((r: any) => {
              const ag = Array.isArray(r.agendamentos) ? r.agendamentos[0] : null;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-ink2/30">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-cream">{r.nome}</td>
                  <td className="p-3 text-muted-foreground"><div>{r.email}</div><div className="text-xs">{r.telefone}</div></td>
                  <td className="p-3"><PaymentBadge status={r.payment_status} /></td>
                  <td className="p-3 text-muted-foreground">{ag ? (<div><div className="text-cream">{new Date(ag.data_hora).toLocaleString("pt-BR")}</div>{ag.google_meet_link && <a className="text-xs text-gold-l" href={ag.google_meet_link}>Meet</a>}</div>) : <span className="text-xs">—</span>}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">Nenhuma inscrição ainda.</td></tr>}
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
  const [rows, setRows] = useState<Array<{ dia_semana: number; hora_inicio: string; hora_fim: string }>>([]);

  useEffect(() => {
    if (!data) return;
    setRows(data.rows.filter((r: any) => r.ativo).map((r: any) => ({
      dia_semana: r.dia_semana,
      hora_inicio: r.hora_inicio.slice(0, 5),
      hora_fim: r.hora_fim.slice(0, 5),
    })));
  }, [data]);

  const mut = useMutation({
    mutationFn: async () => {
      const items = rows.map(r => ({
        dia_semana: r.dia_semana,
        hora_inicio: r.hora_inicio.length === 5 ? `${r.hora_inicio}:00` : r.hora_inicio,
        hora_fim: r.hora_fim.length === 5 ? `${r.hora_fim}:00` : r.hora_fim,
        ativo: true,
      }));
      await setFn({ data: { items } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-disp"] }),
  });

  if (isLoading) return <Loader2 className="animate-spin text-gold" />;

  return (
    <div>
      <h2 className="font-serif text-2xl text-cream mb-1">Disponibilidade semanal</h2>
      <p className="text-sm text-muted-foreground mb-6">Adicione janelas livres em qualquer dia/horário. Os slots de atendimento são gerados dentro dessas janelas.</p>
      <div className="space-y-2 mb-4">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 bg-ink2/40 border border-border rounded-md p-2">
            <select className="fi !w-auto" value={r.dia_semana} onChange={e => setRows(rs => rs.map((x, j) => j === i ? { ...x, dia_semana: Number(e.target.value) } : x))}>
              {DIAS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
            </select>
            <input type="time" className="fi !w-auto" value={r.hora_inicio} onChange={e => setRows(rs => rs.map((x, j) => j === i ? { ...x, hora_inicio: e.target.value } : x))} />
            <span className="text-muted-foreground text-xs">até</span>
            <input type="time" className="fi !w-auto" value={r.hora_fim} onChange={e => setRows(rs => rs.map((x, j) => j === i ? { ...x, hora_fim: e.target.value } : x))} />
            <button onClick={() => setRows(rs => rs.filter((_, j) => j !== i))} className="ml-auto text-muted-foreground hover:text-red-400 p-1"><Trash2 size={14} /></button>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-md">Nenhuma janela ainda.</div>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setRows(rs => [...rs, { dia_semana: 1, hora_inicio: "09:00", hora_fim: "12:00" }])} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-ink2 px-3 py-2 text-xs hover:border-gold-line"><Plus size={12} /> Adicionar janela</button>
        <button onClick={() => mut.mutate()} disabled={mut.isPending} className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
        </button>
        {mut.isSuccess && <span className="text-xs text-emerald-400 self-center">Salvo.</span>}
      </div>
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

  const mut = useMutation({ mutationFn: () => updFn({ data: form }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }) });
  if (isLoading) return <Loader2 className="animate-spin text-gold" />;

  return (
    <div className="max-w-md">
      <h2 className="font-serif text-2xl text-cream mb-1">Geral</h2>
      <p className="text-sm text-muted-foreground mb-6">Ajustes de agendamento.</p>
      <div className="space-y-4">
        <Field label="Duração do slot (min)"><input type="number" className="fi" value={form.slot_duracao_min} onChange={e => setForm({ ...form, slot_duracao_min: Number(e.target.value) })} /></Field>
        <Field label="Antecedência mínima (horas)"><input type="number" className="fi" value={form.antecedencia_min_horas} onChange={e => setForm({ ...form, antecedencia_min_horas: Number(e.target.value) })} /></Field>
        <Field label="Valor da consulta (R$)"><input type="number" step="0.01" className="fi" value={form.consulta_valor} onChange={e => setForm({ ...form, consulta_valor: Number(e.target.value) })} /></Field>
        <button onClick={() => mut.mutate()} disabled={mut.isPending} className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
        </button>
        {mut.isSuccess && <span className="ml-3 text-xs text-emerald-400">Salvo.</span>}
      </div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

// ===== Site settings tab (single component, switches section) =====
function TabSiteSettings({ section }: { section: "marca" | "contato" | "header" | "pagamento" | "gcal" }) {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetSiteSettings);
  const updFn = useServerFn(adminUpdateSiteSettings);
  const { data, isLoading } = useQuery({ queryKey: ["admin-site-settings"], queryFn: () => getFn() });
  const [form, setForm] = useState<any>(null);

  useEffect(() => { if (data?.settings) setForm({ ...data.settings }); }, [data]);

  const mut = useMutation({
    mutationFn: async (payload: any) => updFn({ data: payload }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-site-settings"] }); qc.invalidateQueries({ queryKey: ["site-settings"] }); },
  });

  if (isLoading || !form) return <Loader2 className="animate-spin text-gold" />;

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const save = (keys: string[]) => {
    const payload: any = {};
    for (const k of keys) payload[k] = form[k];
    mut.mutate(payload);
  };

  return (
    <div className="max-w-3xl">
      {section === "marca" && <SectionMarca form={form} set={set} save={save} mut={mut} />}
      {section === "contato" && <SectionContato form={form} set={set} save={save} mut={mut} />}
      {section === "header" && <SectionHeader form={form} set={set} save={save} mut={mut} />}
      {section === "pagamento" && <SectionPagamento form={form} set={set} save={save} mut={mut} mpConfigured={data!.mpConfigured} />}
      {section === "gcal" && <SectionGCal form={form} set={set} save={save} mut={mut} gcalConfigured={data!.gcalConfigured} />}
    </div>
  );
}

function SaveBar({ mut, onSave }: { mut: any; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-4 mt-6 border-t border-border">
      <button onClick={onSave} disabled={mut.isPending} className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
      </button>
      {mut.isSuccess && <span className="text-xs text-emerald-400">Salvo.</span>}
      {mut.isError && <span className="text-xs text-red-400">Erro ao salvar.</span>}
    </div>
  );
}

function ImageUpload({ value, onChange, label, accept = "image/*" }: { value: string | null; onChange: (url: string) => void; label: string; accept?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleFile = async (file: File) => {
    setUploading(true); setError(null);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${label.toLowerCase()}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) { setError(e.message ?? "Erro"); }
    finally { setUploading(false); }
  };
  return (
    <div>
      <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1.5">{label}</div>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="h-14 w-14 object-cover rounded border border-border bg-ink2" />}
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-ink2 px-3 py-2 text-xs hover:border-gold-line disabled:opacity-50">
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} {value ? "Trocar" : "Enviar"}
        </button>
        {value && <button onClick={() => onChange("")} className="text-xs text-muted-foreground hover:text-red-400">Remover</button>}
      </div>
      {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      <input type="text" placeholder="Ou cole uma URL" className="fi mt-2" value={value ?? ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function SectionMarca({ form, set, save, mut }: any) {
  const embed = youtubeEmbedUrl(form.video_youtube_url);
  return (
    <div className="space-y-5">
      <div><h2 className="font-serif text-2xl text-cream mb-1">Marca & Mídia</h2><p className="text-sm text-muted-foreground mb-4">Identidade visual exibida em todas as páginas.</p></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <ImageUpload value={form.logo_url} onChange={v => set("logo_url", v)} label="Logo" />
        <ImageUpload value={form.favicon_url} onChange={v => set("favicon_url", v)} label="Favicon" accept="image/png,image/x-icon,image/svg+xml" />
      </div>
      <ImageUpload value={form.foto_principal_url} onChange={v => set("foto_principal_url", v)} label="Foto principal (hero/sobre)" />
      <Field label="Nome da empresa"><input className="fi" value={form.empresa_nome ?? ""} onChange={e => set("empresa_nome", e.target.value)} /></Field>
      <Field label="Slogan"><input className="fi" value={form.empresa_slogan ?? ""} onChange={e => set("empresa_slogan", e.target.value)} /></Field>
      <Field label="Descrição curta"><textarea className="fi" rows={3} value={form.empresa_descricao ?? ""} onChange={e => set("empresa_descricao", e.target.value)} /></Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome do médico"><input className="fi" value={form.medico_nome ?? ""} onChange={e => set("medico_nome", e.target.value)} /></Field>
        <Field label="CRM"><input className="fi" value={form.crm ?? ""} onChange={e => set("crm", e.target.value)} /></Field>
      </div>
      <Field label="Especialidade"><input className="fi" value={form.especialidade ?? ""} onChange={e => set("especialidade", e.target.value)} /></Field>
      <Field label="Vídeo do YouTube (URL ou ID)" hint="Cole o link do vídeo. Será incorporado na landing page.">
        <div className="flex items-center gap-2"><Youtube size={16} className="text-muted-foreground" /><input className="fi" placeholder="https://youtube.com/watch?v=..." value={form.video_youtube_url ?? ""} onChange={e => set("video_youtube_url", e.target.value)} /></div>
      </Field>
      {embed && <div className="aspect-video rounded border border-border overflow-hidden"><iframe src={embed} className="w-full h-full" allowFullScreen /></div>}
      <SaveBar mut={mut} onSave={() => save(["logo_url","favicon_url","foto_principal_url","empresa_nome","empresa_slogan","empresa_descricao","medico_nome","crm","especialidade","video_youtube_url"])} />
    </div>
  );
}

function SectionContato({ form, set, save, mut }: any) {
  return (
    <div className="space-y-5">
      <div><h2 className="font-serif text-2xl text-cream mb-1">Contato & Endereço</h2><p className="text-sm text-muted-foreground mb-4">Aparecem no rodapé e nos contatos do site.</p></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Telefone"><input className="fi" value={form.telefone ?? ""} onChange={e => set("telefone", e.target.value)} /></Field>
        <Field label="WhatsApp (só números, com DDI)" hint="Ex: 5549999318583"><input className="fi" value={form.whatsapp ?? ""} onChange={e => set("whatsapp", e.target.value)} /></Field>
      </div>
      <Field label="E-mail de contato"><input className="fi" type="email" value={form.email_contato ?? ""} onChange={e => set("email_contato", e.target.value)} /></Field>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="CEP"><input className="fi" value={form.cep ?? ""} onChange={e => set("cep", e.target.value)} /></Field>
        <div className="sm:col-span-2"><Field label="Logradouro"><input className="fi" value={form.logradouro ?? ""} onChange={e => set("logradouro", e.target.value)} /></Field></div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Número"><input className="fi" value={form.numero ?? ""} onChange={e => set("numero", e.target.value)} /></Field>
        <Field label="Complemento"><input className="fi" value={form.complemento ?? ""} onChange={e => set("complemento", e.target.value)} /></Field>
        <Field label="Bairro"><input className="fi" value={form.bairro ?? ""} onChange={e => set("bairro", e.target.value)} /></Field>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2"><Field label="Cidade"><input className="fi" value={form.cidade ?? ""} onChange={e => set("cidade", e.target.value)} /></Field></div>
        <Field label="Estado (UF)"><input className="fi" value={form.estado ?? ""} maxLength={2} onChange={e => set("estado", e.target.value.toUpperCase())} /></Field>
      </div>
      <SaveBar mut={mut} onSave={() => save(["telefone","whatsapp","email_contato","cep","logradouro","numero","complemento","bairro","cidade","estado"])} />
    </div>
  );
}

function LinksEditor({ value, onChange, label }: { value: Array<{ label: string; href: string }>; onChange: (v: Array<{ label: string; href: string }>) => void; label: string }) {
  const items = value ?? [];
  return (
    <div>
      <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1.5">{label}</div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input className="fi" placeholder="Texto" value={it.label} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
            <input className="fi" placeholder="URL ou /caminho" value={it.href} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-400 px-2"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...items, { label: "", href: "" }])} className="mt-2 inline-flex items-center gap-1 text-xs text-gold-l hover:text-gold"><Plus size={12} /> Adicionar link</button>
    </div>
  );
}

function SectionHeader({ form, set, save, mut }: any) {
  const social = form.redes_sociais ?? {};
  const setSocial = (k: string, v: string) => set("redes_sociais", { ...social, [k]: v });
  return (
    <div className="space-y-5">
      <div><h2 className="font-serif text-2xl text-cream mb-1">Cabeçalho & Rodapé</h2><p className="text-sm text-muted-foreground mb-4">Textos e links exibidos em todo o site.</p></div>
      <Field label="Texto do botão CTA no cabeçalho"><input className="fi" value={form.header_cta_texto ?? ""} onChange={e => set("header_cta_texto", e.target.value)} /></Field>
      <LinksEditor value={form.header_links ?? []} onChange={v => set("header_links", v)} label="Links de navegação (cabeçalho)" />
      <Field label="Texto livre do rodapé"><textarea className="fi" rows={2} value={form.footer_texto ?? ""} onChange={e => set("footer_texto", e.target.value)} /></Field>
      <Field label="Aviso legal do rodapé"><input className="fi" value={form.footer_aviso_legal ?? ""} onChange={e => set("footer_aviso_legal", e.target.value)} /></Field>
      <LinksEditor value={form.footer_links ?? []} onChange={v => set("footer_links", v)} label="Links do rodapé" />
      <div>
        <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1.5">Redes sociais</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {["instagram","facebook","linkedin","youtube"].map(k => (
            <input key={k} className="fi" placeholder={`URL ${k}`} value={social[k] ?? ""} onChange={e => setSocial(k, e.target.value)} />
          ))}
        </div>
      </div>
      <SaveBar mut={mut} onSave={() => save(["header_cta_texto","header_links","footer_texto","footer_aviso_legal","footer_links","redes_sociais"])} />
    </div>
  );
}

function SectionPagamento({ form, set, save, mut, mpConfigured }: any) {
  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/public/mp-webhook` : "";
  return (
    <div className="space-y-5">
      <div><h2 className="font-serif text-2xl text-cream mb-1">Pagamento (Mercado Pago)</h2><p className="text-sm text-muted-foreground mb-4">Configure o checkout do Pix/boleto/cartão.</p></div>
      <div className={`rounded-md border p-4 ${mpConfigured ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
        <div className="text-sm flex items-center gap-2">{mpConfigured ? <><Check size={14} className="text-emerald-400" /> <span className="text-emerald-300">Access Token configurado</span></> : <><X size={14} className="text-amber-400" /> <span className="text-amber-300">Access Token não configurado</span></>}</div>
        <p className="text-xs text-muted-foreground mt-2">O <b>Access Token</b> é privado e fica armazenado como secret <code className="text-gold-l">MERCADOPAGO_ACCESS_TOKEN</code>. Para atualizar, peça no chat: "atualizar token Mercado Pago".</p>
      </div>
      <Field label="Chave pública (Public Key)" hint="Chave pública do Mercado Pago — usada no frontend."><input className="fi" value={form.mp_public_key ?? ""} onChange={e => set("mp_public_key", e.target.value)} /></Field>
      <Field label="URL do webhook (cole no painel Mercado Pago)">
        <div className="flex gap-2"><input className="fi" readOnly value={webhookUrl} /><button onClick={() => navigator.clipboard.writeText(webhookUrl)} className="inline-flex items-center gap-1 rounded-md border border-border bg-ink2 px-3 text-xs hover:border-gold-line"><Copy size={12} /> Copiar</button></div>
      </Field>
      <SaveBar mut={mut} onSave={() => save(["mp_public_key"])} />
    </div>
  );
}

function SectionGCal({ form, set, save, mut, gcalConfigured }: any) {
  return (
    <div className="space-y-5">
      <div><h2 className="font-serif text-2xl text-cream mb-1">Google Calendar</h2><p className="text-sm text-muted-foreground mb-4">Conecte a agenda do Google para criar eventos com Google Meet automaticamente.</p></div>
      <div className={`rounded-md border p-4 ${gcalConfigured ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
        <div className="text-sm flex items-center gap-2">{gcalConfigured ? <><Check size={14} className="text-emerald-400" /> <span className="text-emerald-300">OAuth conectado</span></> : <><X size={14} className="text-amber-400" /> <span className="text-amber-300">OAuth não conectado</span></>}</div>
        <p className="text-xs text-muted-foreground mt-2">Para habilitar a criação automática de eventos + Meet, forneça as credenciais OAuth Google (Client ID/Secret) no chat. Até lá, o link público abaixo pode ser usado para exibir sua agenda.</p>
      </div>
      <Field label="Calendar ID" hint="Use 'primary' para a agenda principal, ou cole o ID de outra agenda."><input className="fi" value={form.gcal_calendar_id ?? ""} onChange={e => set("gcal_calendar_id", e.target.value)} /></Field>
      <Field label="Link público da agenda" hint="Link de visualização pública do Google Calendar (opcional)."><input className="fi" placeholder="https://calendar.google.com/calendar/embed?src=..." value={form.gcal_calendar_link_publico ?? ""} onChange={e => set("gcal_calendar_link_publico", e.target.value)} /></Field>
      <Field label="URL ICS privada (opcional)" hint="Para sincronizar busy times sem OAuth."><input className="fi" value={form.gcal_ics_url ?? ""} onChange={e => set("gcal_ics_url", e.target.value)} /></Field>
      <SaveBar mut={mut} onSave={() => save(["gcal_calendar_id","gcal_calendar_link_publico","gcal_ics_url"])} />
    </div>
  );
}
