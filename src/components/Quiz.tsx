import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles, X } from "lucide-react";

const STEPS = [
  "Pessoal", "Endereço", "Queixas", "Clínica",
  "Vascular", "Histórico", "PDE5i", "Objetivo", "Pronto",
];

const QUEIXAS: { id: string; label: string; sub: string }[] = [
  { id: "de", label: "Disfunção erétil", sub: "Dificuldade em obter ou manter ereção" },
  { id: "ep", label: "Ejaculação precoce", sub: "Dificuldade no controle da latência ejaculatória" },
  { id: "hormonal", label: "Queda de libido / desequilíbrio hormonal", sub: "Baixo desejo, fadiga, perda de massa muscular" },
  { id: "peyronie", label: "Doença de Peyronie", sub: "Placa fibrótica, curvatura ou dor na ereção" },
  { id: "mental", label: "Fadiga mental / sono / ansiedade", sub: "Insônia, dificuldade de foco ou estresse elevado" },
];

const QL: Record<string, string> = {
  de: "Disfunção Erétil",
  ep: "Ejaculação Precoce",
  hormonal: "Desequilíbrio Hormonal",
  peyronie: "Doença de Peyronie",
  mental: "Fadiga Mental / Sono",
};

const CLINICAL_QUESTIONS: Record<string, { id: string; q: string; opts: { v: string; l: string }[] }[]> = {
  de: [
    { id: "rigidez", q: "Como avalia a rigidez nas tentativas recentes?", opts: [
      { v: "boa", l: "Boa rigidez na maioria das vezes" },
      { v: "intermitente", l: "Rigidez intermitente / variável" },
      { v: "ruim", l: "Quase nunca consigo rigidez satisfatória" },
    ]},
    { id: "tempo", q: "Há quanto tempo o quadro está presente?", opts: [
      { v: "<3m", l: "Menos de 3 meses" },
      { v: "3-12m", l: "3 a 12 meses" },
      { v: ">12m", l: "Mais de 12 meses" },
    ]},
  ],
  ep: [
    { id: "latencia", q: "Tempo médio até a ejaculação na penetração?", opts: [
      { v: ">3", l: "Mais de 3 minutos" },
      { v: "1-3", l: "1 a 3 minutos" },
      { v: "<1", l: "Menos de 1 minuto" },
    ]},
  ],
  hormonal: [
    { id: "libido", q: "Como está o desejo sexual nos últimos 6 meses?", opts: [
      { v: "normal", l: "Normal" },
      { v: "reduzido", l: "Reduzido" },
      { v: "ausente", l: "Praticamente ausente" },
    ]},
    { id: "energia", q: "Disposição e energia ao longo do dia?", opts: [
      { v: "boa", l: "Boa" },
      { v: "media", l: "Média" },
      { v: "baixa", l: "Muito baixa / fadiga constante" },
    ]},
  ],
  peyronie: [
    { id: "curva", q: "Existe curvatura ou dor durante a ereção?", opts: [
      { v: "leve", l: "Leve / quase imperceptível" },
      { v: "moderada", l: "Moderada — incomoda" },
      { v: "intensa", l: "Intensa — impede ou dói" },
    ]},
  ],
  mental: [
    { id: "sono", q: "Qualidade do sono nas últimas semanas?", opts: [
      { v: "bom", l: "Bom — durmo bem" },
      { v: "irregular", l: "Irregular" },
      { v: "ruim", l: "Ruim — insônia frequente" },
    ]},
    { id: "ansiedade", q: "Nível de ansiedade no dia a dia?", opts: [
      { v: "baixo", l: "Baixo" },
      { v: "medio", l: "Médio" },
      { v: "alto", l: "Alto / constante" },
    ]},
  ],
};

type State = {
  nome: string; nasc: string; cpf: string; sexo: string; tel: string; email: string;
  peso: string; altura: string;
  cep: string; logr: string; num: string; comp: string; bairro: string; cidade: string; estado: string;
  queixas: string[]; clin: Record<string, Record<string, string>>;
  matinal: string; hab: string[]; com: string[]; pde5: string; obj: string;
};

const initial: State = {
  nome: "", nasc: "", cpf: "", sexo: "", tel: "", email: "",
  peso: "", altura: "",
  cep: "", logr: "", num: "", comp: "", bairro: "", cidade: "", estado: "",
  queixas: [], clin: {}, matinal: "", hab: [], com: [], pde5: "", obj: "",
};

function mCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function mPhone(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
function mCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

export function Quiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [s, setS] = useState<State>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open) { setStep(1); setS(initial); setDone(false); setError(null); }
  }, [open]);

  const total = STEPS.length;
  const pct = Math.round((step / total) * 100);

  const update = (patch: Partial<State>) => setS(p => ({ ...p, ...patch }));

  // Auto-fetch CEP
  useEffect(() => {
    const clean = s.cep.replace(/\D/g, "");
    if (clean.length === 8) {
      fetch(`https://viacep.com.br/ws/${clean}/json/`)
        .then(r => r.json())
        .then(d => {
          if (!d.erro) {
            update({ logr: d.logradouro || s.logr, bairro: d.bairro || s.bairro, cidade: d.localidade || s.cidade, estado: d.uf || s.estado });
          }
        }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.cep]);

  const canNext = useMemo(() => {
    if (step === 1) return s.nome.trim().length > 2 && s.email.includes("@") && s.tel.replace(/\D/g, "").length >= 10;
    if (step === 2) return s.cep.replace(/\D/g, "").length === 8 && s.cidade && s.estado;
    if (step === 3) return s.queixas.length > 0;
    if (step === 4) {
      return s.queixas.every(q => {
        const qs = CLINICAL_QUESTIONS[q] || [];
        return qs.every(x => s.clin[q]?.[x.id]);
      });
    }
    if (step === 5) return !!s.matinal;
    if (step === 6) return true;
    if (step === 7) return !!s.pde5;
    if (step === 8) return !!s.obj;
    return true;
  }, [s, step]);

  const toggleQueixa = (id: string) => {
    update({ queixas: s.queixas.includes(id) ? s.queixas.filter(x => x !== id) : [...s.queixas, id] });
  };
  const setClin = (q: string, k: string, v: string) => {
    update({ clin: { ...s.clin, [q]: { ...(s.clin[q] || {}), [k]: v } } });
  };
  const toggleArr = (key: "hab" | "com", v: string) => {
    update({ [key]: s[key].includes(v) ? s[key].filter(x => x !== v) : [...s[key], v] } as Partial<State>);
  };

  const next = () => { if (canNext) setStep(x => Math.min(total, x + 1)); };
  const back = () => setStep(x => Math.max(1, x - 1));

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nome: s.nome, email: s.email, telefone: s.tel,
        data_nascimento: s.nasc || null,
        cpf: s.cpf || null, sexo: s.sexo || null,
        peso: s.peso ? Number(s.peso) : null, altura: s.altura ? Number(s.altura) : null,
        cep: s.cep || null, logradouro: s.logr || null, numero: s.num || null,
        complemento: s.comp || null, bairro: s.bairro || null,
        cidade: s.cidade || null, estado: s.estado || null,
        queixas: s.queixas, clinicas: s.clin,
        matinal: s.matinal || null, habitos: s.hab, comorbidades: s.com,
        pde5: s.pde5 || null, objetivo: s.obj || null,
      };
      const { error: insErr } = await supabase.from("inscricoes").insert(payload as never);
      if (insErr) throw insErr;
      // Notificação por e-mail (silenciosa — falha não bloqueia)
      fetch("/api/public/notify-inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: s.nome, email: s.email, telefone: s.tel }),
      }).catch(() => {});
      setDone(true);
      setStep(total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur-xl">
        <div className="font-serif text-[1.05rem] tracking-wide text-gold-l">
          LFL Saúde Masculina <span className="text-muted-foreground text-[0.8em]">/ Avaliação</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] tracking-widest text-muted-foreground">{step} / {total}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
      </header>
      <div className="sticky top-14 z-10 h-[2px] bg-white/5">
        <div className="h-full transition-all duration-500" style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--gold-d), var(--gold), var(--gold-l))",
        }} />
      </div>

      {/* Dots */}
      <div className="sticky top-[58px] z-10 flex items-center gap-2 overflow-x-auto border-b border-border bg-background/90 px-5 py-3 backdrop-blur-md">
        {STEPS.map((n, i) => {
          const k = i + 1;
          const state = k < step ? "done" : k === step ? "active" : "todo";
          return (
            <div key={n} className="flex items-center gap-2 shrink-0">
              <button
                title={n}
                onClick={() => k < step && setStep(k)}
                className={`h-[6px] w-[6px] rounded-full transition-all ${
                  state === "active" ? "bg-gold scale-150 shadow-[0_0_6px_rgba(184,150,90,0.4)]"
                    : state === "done" ? "bg-gold-d"
                    : "bg-muted"
                }`}
              />
              {i < STEPS.length - 1 && <div className="h-px w-3 bg-muted opacity-30" />}
            </div>
          );
        })}
      </div>

      <main className="mx-auto max-w-[560px] px-5 py-8 pb-24">
        {step === 1 && (
          <StepShell label="Identificação" title={<>Dados <em>pessoais</em></>} sub="Necessários para o prontuário e contato.">
            <Row2>
              <Field label="Nome completo"><input className="fi" value={s.nome} onChange={e => update({ nome: e.target.value })} placeholder="Nome e sobrenome" autoComplete="name" /></Field>
              <Field label="Data de nascimento"><input type="date" className="fi" value={s.nasc} onChange={e => update({ nasc: e.target.value })} /></Field>
            </Row2>
            <Row2>
              <Field label="CPF"><input className="fi" value={s.cpf} onChange={e => update({ cpf: mCPF(e.target.value) })} placeholder="000.000.000-00" inputMode="numeric" /></Field>
              <Field label="Sexo biológico">
                <select className="fi" value={s.sexo} onChange={e => update({ sexo: e.target.value })}>
                  <option value="" disabled>Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </Field>
            </Row2>
            <Row2>
              <Field label="Telefone / WhatsApp"><input className="fi" value={s.tel} onChange={e => update({ tel: mPhone(e.target.value) })} placeholder="(00) 00000-0000" inputMode="tel" /></Field>
              <Field label="E-mail"><input type="email" className="fi" value={s.email} onChange={e => update({ email: e.target.value })} placeholder="seu@email.com" autoComplete="email" /></Field>
            </Row2>
            <Row2>
              <Field label="Peso (kg)"><input type="number" className="fi" value={s.peso} onChange={e => update({ peso: e.target.value })} placeholder="Ex: 85" /></Field>
              <Field label="Altura (cm)"><input type="number" className="fi" value={s.altura} onChange={e => update({ altura: e.target.value })} placeholder="Ex: 178" /></Field>
            </Row2>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell label="Endereço" title={<>Onde <em>você mora?</em></>} sub="Usado para emissão do receituário e farmácia de manipulação.">
            <Row2>
              <Field label="CEP"><input className="fi" value={s.cep} onChange={e => update({ cep: mCEP(e.target.value) })} placeholder="00000-000" inputMode="numeric" /></Field>
              <Field label="Estado">
                <select className="fi" value={s.estado} onChange={e => update({ estado: e.target.value })}>
                  <option value="" disabled>UF</option>
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(u => <option key={u}>{u}</option>)}
                </select>
              </Field>
            </Row2>
            <Field label="Logradouro"><input className="fi" value={s.logr} onChange={e => update({ logr: e.target.value })} placeholder="Rua, Avenida..." /></Field>
            <Row2>
              <Field label="Número"><input className="fi" value={s.num} onChange={e => update({ num: e.target.value })} placeholder="123" /></Field>
              <Field label="Complemento (opcional)"><input className="fi" value={s.comp} onChange={e => update({ comp: e.target.value })} placeholder="Apto, Bloco..." /></Field>
            </Row2>
            <Row2>
              <Field label="Bairro"><input className="fi" value={s.bairro} onChange={e => update({ bairro: e.target.value })} placeholder="Bairro" /></Field>
              <Field label="Cidade"><input className="fi" value={s.cidade} onChange={e => update({ cidade: e.target.value })} placeholder="Cidade" /></Field>
            </Row2>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell label="Queixas" title={<>O que incomoda <em>você?</em></>} sub="Selecione todas as condições presentes no quadro atual.">
            <Note>Seleção múltipla — marque tudo que se aplica</Note>
            <div className="flex flex-col gap-1.5">
              {QUEIXAS.map(q => (
                <OptBtn key={q.id} selected={s.queixas.includes(q.id)} onClick={() => toggleQueixa(q.id)}>
                  <Mark on={s.queixas.includes(q.id)} />
                  <div>
                    <div className="font-medium text-cream">{q.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{q.sub}</div>
                  </div>
                </OptBtn>
              ))}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell label="Avaliação clínica" title={<>Perguntas sobre <em>cada condição</em></>} sub="Suas respostas orientam a investigação do médico.">
            <QBadge queixas={s.queixas} />
            {s.queixas.map(q => {
              const qs = CLINICAL_QUESTIONS[q] || [];
              return (
                <div key={q} className="border border-border rounded-md mb-3 overflow-hidden">
                  <div className="px-4 py-2 bg-ink2 border-b border-border text-[10px] font-medium tracking-[0.14em] uppercase text-gold">{QL[q]}</div>
                  {qs.map(item => (
                    <div key={item.id} className="px-4 py-3 border-b border-border last:border-0">
                      <div className="text-sm font-medium text-cream mb-2">{item.q}</div>
                      <div className="flex flex-col gap-1.5">
                        {item.opts.map(o => (
                          <button
                            key={o.v}
                            onClick={() => setClin(q, item.id, o.v)}
                            className={`flex items-center gap-2 rounded border px-3 py-2 text-left text-sm transition-all ${
                              s.clin[q]?.[item.id] === o.v
                                ? "border-gold bg-gold-dim text-gold-l"
                                : "border-border bg-background text-muted-foreground hover:border-gold-line hover:text-foreground"
                            }`}
                          >
                            <span className={`h-3 w-3 rounded-full border-[1.5px] ${s.clin[q]?.[item.id] === o.v ? "border-gold bg-gold" : "border-muted"}`} />
                            {o.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </StepShell>
        )}

        {step === 5 && (
          <StepShell label="Marcador vascular" title={<>Ereções <em>matinais</em></>} sub="Indicador direto do eixo vascular e hormonal noturno.">
            <QBadge queixas={s.queixas} />
            <div className="flex flex-col gap-1.5">
              {[
                { v: "frequentes", l: "Frequentes — quase todo dia", s: "Sinal favorável de testosterona e circulação" },
                { v: "ocasionais", l: "Ocasionais — algumas vezes por semana", s: "Alerta moderado" },
                { v: "raras", l: "Raras ou ausentes", s: "Sugere déficit hormonal ou componente vascular" },
              ].map(o => (
                <OptBtn key={o.v} selected={s.matinal === o.v} onClick={() => update({ matinal: o.v })}>
                  <Mark on={s.matinal === o.v} circle />
                  <div><div className="font-medium text-cream">{o.l}</div><div className="text-xs text-muted-foreground mt-0.5">{o.s}</div></div>
                </OptBtn>
              ))}
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell label="Histórico clínico" title={<>Hábitos e <em>comorbidades</em></>} sub="Selecione todos que se aplicam (opcional).">
            <SectionLabel>Hábitos de vida</SectionLabel>
            <div className="flex flex-col gap-1.5 mb-5">
              {[
                ["alcool", "Consumo regular de álcool"], ["tabagismo", "Tabagismo"],
                ["sedentario", "Sedentarismo (menos de 3 sessões/semana)"], ["maledorme", "Sono ruim ou menos de 6h/noite"],
                ["estresse", "Alto nível de estresse crônico"], ["obesidade", "Sobrepeso ou obesidade abdominal"],
              ].map(([v, l]) => (
                <Check2 key={v} on={s.hab.includes(v)} onClick={() => toggleArr("hab", v)}>{l}</Check2>
              ))}
            </div>
            <SectionLabel>Condições de saúde</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {[
                ["has", "Hipertensão arterial"], ["dm2", "Diabetes tipo 2 ou pré-diabetes"],
                ["dislipidemia", "Dislipidemia"], ["ansiedadeTx", "Ansiedade ou depressão em tratamento"],
                ["nenhuma", "Nenhuma das anteriores"],
              ].map(([v, l]) => (
                <Check2 key={v} on={s.com.includes(v)} onClick={() => toggleArr("com", v)}>{l}</Check2>
              ))}
            </div>
          </StepShell>
        )}

        {step === 7 && (
          <StepShell label="Tratamentos anteriores" title={<>Resposta a <em>inibidores de PDE5</em></>} sub="Viagra, Cialis, Levitra ou similares.">
            <div className="flex flex-col gap-1.5">
              {[
                { v: "nunca", l: "Nunca utilizou" },
                { v: "boa", l: "Utilizou — boa resposta", s: "Efeito satisfatório e consistente" },
                { v: "parcial", l: "Utilizou — resposta parcial", s: "Alguma melhora, porém insuficiente" },
                { v: "nenhuma", l: "Utilizou — sem resposta", s: "Ausência de efeito mesmo com dose adequada" },
              ].map(o => (
                <OptBtn key={o.v} selected={s.pde5 === o.v} onClick={() => update({ pde5: o.v })}>
                  <Mark on={s.pde5 === o.v} circle />
                  <div><div className="font-medium text-cream">{o.l}</div>{o.s && <div className="text-xs text-muted-foreground mt-0.5">{o.s}</div>}</div>
                </OptBtn>
              ))}
            </div>
          </StepShell>
        )}

        {step === 8 && (
          <StepShell label="Prioridade terapêutica" title={<>O que é mais importante <em>agora?</em></>} sub="Define a ênfase do plano de tratamento.">
            <div className="flex flex-col gap-1.5">
              {[
                { v: "desempenho", l: "Melhorar o desempenho sexual", s: "Ereção, rigidez e confiança" },
                { v: "hormonal", l: "Recuperar energia e equilíbrio hormonal", s: "Disposição, testosterona e vitalidade" },
                { v: "controle", l: "Controlar a ejaculação", s: "Mais tempo e satisfação" },
                { v: "mental", l: "Melhorar sono, foco e ansiedade", s: "Clareza mental e menos tensão" },
                { v: "completo", l: "Tratar tudo de forma integrada", s: "Abordagem completa" },
              ].map(o => (
                <OptBtn key={o.v} selected={s.obj === o.v} onClick={() => update({ obj: o.v })}>
                  <Mark on={s.obj === o.v} circle />
                  <div><div className="font-medium text-cream">{o.l}</div><div className="text-xs text-muted-foreground mt-0.5">{o.s}</div></div>
                </OptBtn>
              ))}
            </div>
          </StepShell>
        )}

        {step === 9 && (
          <div className="flex flex-col items-center text-center py-12">
            {!done ? (
              <>
                <div className="h-20 w-20 rounded-full bg-gold-dim border border-gold-line flex items-center justify-center mb-6">
                  {submitting ? <Loader2 className="h-7 w-7 text-gold animate-spin" /> : <Sparkles className="h-7 w-7 text-gold" />}
                </div>
                <h2 className="font-serif text-3xl text-cream mb-2">Revisar e enviar</h2>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                  Seus dados serão enviados ao Dr. Luiz Fernando Lorenci. Entraremos em contato em até 24h para confirmar sua avaliação.
                </p>
                {error && <p className="text-sm text-destructive mb-4">{error}</p>}
                <button
                  disabled={submitting}
                  onClick={submit}
                  className="rounded-md bg-gold px-8 py-3 text-sm font-medium text-primary-foreground tracking-wide transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Confirmar envio →"}
                </button>
              </>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-gold-dim border border-gold-line flex items-center justify-center mb-6">
                  <Check className="h-9 w-9 text-gold" />
                </div>
                <h2 className="font-serif text-3xl text-cream mb-2">Avaliação <em>recebida</em></h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Obrigado, <span className="text-cream">{s.nome.split(" ")[0]}</span>. O Dr. Luiz Fernando entrará em contato pelo WhatsApp em até 24h para agendar sua avaliação. Sigilo absoluto.
                </p>
                <button onClick={onClose} className="rounded-md border border-border px-6 py-2.5 text-sm text-muted-foreground hover:border-gold-line hover:text-foreground transition-colors">
                  Fechar
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Sticky nav */}
      {step < 9 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-5 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[560px] gap-2">
            {step > 1 && (
              <button onClick={back} className="flex items-center gap-1 rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground hover:border-gold-line hover:text-foreground transition-colors">
                <ChevronLeft size={14} /> Voltar
              </button>
            )}
            <button
              disabled={!canNext}
              onClick={step === 8 ? () => setStep(9) : next}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gold px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === 8 ? "Revisar envio" : "Continuar"} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .fi {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.65rem 0.9rem;
          color: var(--foreground);
          font-family: var(--font-sans);
          font-size: 13px;
          outline: none;
          width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .fi:focus { border-color: rgba(184,150,90,0.4); box-shadow: 0 0 0 3px rgba(184,150,90,0.08); }
        .fi::placeholder { color: oklch(0.45 0.015 80); }
      `}</style>
    </div>
  );
}

function StepShell({ label, title, sub, children }: { label: string; title: React.ReactNode; sub: string; children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-3 duration-300">
      <div className="text-[10px] font-medium tracking-[0.18em] uppercase text-gold mb-2">{label}</div>
      <h2 className="font-serif text-2xl text-cream leading-tight mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{sub}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 mb-2">
      <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

function Note({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-muted-foreground border-l-2 border-gold-line pl-2.5 mb-3">{children}</div>;
}

function OptBtn({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition-all w-full ${
        selected ? "border-gold bg-gold-dim" : "border-border bg-ink2 hover:border-gold-line hover:bg-ink3"
      }`}
    >
      {children}
    </button>
  );
}

function Mark({ on, circle }: { on: boolean; circle?: boolean }) {
  return (
    <span className={`h-[14px] w-[14px] mt-0.5 shrink-0 border-[1.5px] flex items-center justify-center transition-all ${
      circle ? "rounded-full" : "rounded-sm"
    } ${on ? "border-gold bg-gold" : "border-muted"}`}>
      {on && (circle
        ? <span className="h-1.5 w-1.5 rounded-full bg-background" />
        : <Check size={10} className="text-background" strokeWidth={3} />
      )}
    </span>
  );
}

function Check2({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-md border px-4 py-2.5 text-sm text-left transition-all ${
        on ? "border-gold bg-gold-dim text-gold-l" : "border-border bg-ink2 text-muted-foreground hover:border-gold-line hover:text-foreground"
      }`}
    >
      <Mark on={on} />
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-2 block">{children}</div>;
}

function QBadge({ queixas }: { queixas: string[] }) {
  if (!queixas.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-4 px-3 py-2 bg-ink2 border border-border rounded-md">
      {queixas.map(q => (
        <span key={q} className="text-[10px] text-gold-l bg-gold-dim border border-gold-line rounded-sm px-2 py-0.5">{QL[q]}</span>
      ))}
    </div>
  );
}
