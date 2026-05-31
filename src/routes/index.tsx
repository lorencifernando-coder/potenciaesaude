import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Lock, ShieldCheck, Stethoscope } from "lucide-react";
import { Quiz } from "@/components/Quiz";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSiteSettings, youtubeEmbedUrl } from "@/hooks/use-site-settings";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dr. Luiz Fernando Lorenci — Avaliação para Disfunção Erétil | Sigilo absoluto" },
      { name: "description", content: "Avaliação médica ética e personalizada para disfunção erétil. Sem venda casada. Receita para manipular onde preferir. CRM-SC 41096." },
      { name: "keywords", content: "disfunção erétil, tratamento, médico, urologia, andrologia, Lages, Santa Catarina, telemedicina" },
      { property: "og:title", content: "Recupere sua Potência — Avaliação médica ética" },
      { property: "og:description", content: "Investigação real da causa: hormonal, vascular ou emocional. Receituário personalizado, sem pacotes abusivos." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: Landing,
});

const TESTIMONIALS = [
  "Ótimo profissional, acima de tudo humano. Um dos melhores que já consultei.",
  "Me lembra os médicos de antigamente — calidez humana, atenção e conhecimento.",
  "Excelente profissional. Seu cuidado e sua escuta são de muita qualidade.",
  "Sabe transmitir tranquilidade em momentos em que o paciente está vulnerável.",
];

const COMMITMENTS = [
  { title: "Diagnóstico investigativo", body: "Vamos analisar seus exames de verdade. Hormonal? Vascular? Emocional? Descobrimos juntos a raiz." },
  { title: "Liberdade de escolha", body: "Você recebe a receita e manipula na farmácia da sua confiança. Sem comissões, sem custos ocultos." },
  { title: "Foco na cura", body: "O objetivo não é deixar você dependente de remédios — é reabilitar a sua função sexual." },
];

const STEPS = [
  { n: "01", t: "Avaliação médica", b: "Consulta completa, ética e sem pressa para entender seu histórico, estilo de vida e queixas." },
  { n: "02", t: "Investigação", b: "Exames laboratoriais direcionados para encontrar a verdadeira causa da disfunção." },
  { n: "03", t: "Tratamento sob medida", b: "Prescrição de fórmulas manipuladas específicas para você. Receita livre — farmácia à sua escolha." },
];

function Landing() {
  const [open, setOpen] = useState(false);
  const { data: site } = useSiteSettings();
  const medico = site?.medico_nome ?? "Dr. Luiz Fernando Lorenci";
  const crm = site?.crm ?? "CRM-SC 41096";
  const especialidade = site?.especialidade ?? "Saúde Masculina";
  const videoEmbed = youtubeEmbedUrl(site?.video_youtube_url);
  const fotoPrincipal = site?.foto_principal_url;
  const consultaValor = site?.consulta_valor ?? 99;
  const precoFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(consultaValor);


  return (
    <>
      <Quiz open={open} onClose={() => setOpen(false)} consultaValor={consultaValor} />

      <div className="min-h-screen bg-background text-foreground">
        {/* Nav */}
        <SiteHeader onCtaClick={() => setOpen(true)} />


        {/* Hero */}
        <section id="top" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(184,150,90,0.18),transparent_70%)]" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,transparent,rgba(184,150,90,0.10),transparent)] blur-3xl" />
          </div>

          <div className="mx-auto max-w-3xl px-5 pt-20 pb-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-line bg-gold-dim px-3 py-1 text-[11px] uppercase tracking-widest text-gold-l mb-8">
              <ShieldCheck size={12} /> Sigilo absoluto • CRM-SC 41096
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl text-cream leading-[1.05] tracking-tight mb-6">
              Recupere sua potência e <em>confiança</em> com um tratamento médico ético e focado na <em>causa</em>.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Chega de clínicas que cobram fortunas e empurram pacotes fechados. Diagnóstico real, exames direcionados e receita personalizada para manipular onde preferir.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                onClick={() => setOpen(true)}
                className="group inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:translate-y-[-1px] shadow-[0_8px_30px_-6px_rgba(184,150,90,0.4)]"
              >
                Agendar avaliação — {precoFmt} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#como" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-3">
                Como funciona
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Lock size={12} /> 100% confidencial</span>
              <span className="inline-flex items-center gap-1.5"><Check size={12} /> Sem venda casada</span>
            </div>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section className="border-t border-border bg-ink2/40">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-4">A indústria falhou com você</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream max-w-2xl mb-6 leading-tight">
              A saúde sexual masculina virou <em>balcão de vendas</em>. Aqui é diferente.
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-12 leading-relaxed">
              Muitos homens sofrem em silêncio com a disfunção erétil ou acabam em clínicas que exploram essa fragilidade — consultas rápidas, pacotes fechados e medicação supercaraturada empurrada no balcão. O meu compromisso é o oposto disso.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {COMMITMENTS.map((c, i) => (
                <div key={i} className="relative rounded-md border border-border bg-background p-6 overflow-hidden group hover:border-gold-line transition-colors">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />
                  <div className="text-[10px] tracking-[0.18em] uppercase text-gold mb-2">0{i + 1}</div>
                  <h3 className="font-serif text-xl text-cream mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Doctor */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">Seu médico</div>
            <div className="flex items-start gap-5 mb-8">
              {fotoPrincipal ? (
                <img src={fotoPrincipal} alt={medico} className="h-16 w-16 shrink-0 rounded-full object-cover border border-gold-line" />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-full bg-gold-dim border border-gold-line flex items-center justify-center">
                  <Stethoscope className="h-7 w-7 text-gold" />
                </div>
              )}
              <div>
                <h2 className="font-serif text-3xl text-cream leading-tight">{medico}</h2>
                <div className="text-sm text-muted-foreground mt-1">{crm} • {especialidade}</div>
              </div>
            </div>

            <blockquote className="border-l-2 border-gold pl-5 mb-6">
              <p className="font-serif text-xl sm:text-2xl text-cream italic leading-relaxed">
                "Quando foi a última vez que um médico realmente te ouviu? Sem olhar para o relógio. Sem a pressa do sistema. Eu quero, legitimamente, ouvir a sua história."
              </p>
            </blockquote>

            <p className="text-muted-foreground leading-relaxed">
              Decidi seguir um caminho diferente da medicina padronizada e fria. Meu foco é oferecer um espaço seguro, sem julgamentos, onde você seja compreendido por completo. A disfunção erétil tem tratamento, e ele começa com uma relação de confiança entre médico e paciente.
            </p>

            {videoEmbed && (
              <div className="mt-10 aspect-video rounded-lg overflow-hidden border border-border bg-ink2">
                <iframe src={videoEmbed} className="w-full h-full" allowFullScreen title="Vídeo informativo" />
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border bg-ink2/40">
          <div className="mx-auto max-w-5xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">O que dizem os pacientes</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-10 max-w-xl leading-tight">
              Confiança construída através da <em>empatia</em>.
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {TESTIMONIALS.map((t, i) => (
                <figure key={i} className="rounded-md border border-border bg-background p-6">
                  <div className="text-gold-l font-serif text-2xl leading-none mb-2">"</div>
                  <blockquote className="text-sm text-foreground leading-relaxed">{t}</blockquote>
                </figure>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6 italic">
              Devido à sensibilidade do tema e ao sigilo médico, exibimos depoimentos que atestam a postura ética e humana do Dr. Lorenci.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="como" className="border-t border-border">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">Como funciona</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-12 max-w-xl leading-tight">
              Três passos para sua <em>reabilitação</em>.
            </h2>
            <div className="space-y-1">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-6 sm:gap-10 border-t border-border py-8 first:border-t-0">
                  <div className="font-serif text-4xl text-gold-l/40 tabular-nums shrink-0 w-12">{step.n}</div>
                  <div>
                    <h3 className="font-serif text-2xl text-cream mb-2">{step.t}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-lg">{step.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-gradient-to-b from-ink2 to-background">
          <div className="mx-auto max-w-3xl px-5 py-24 text-center">
            <h2 className="font-serif text-4xl sm:text-5xl text-cream mb-5 leading-tight">
              Sua avaliação começa em <em>5 minutos</em>.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Preencha o questionário confidencial. O Dr. Lorenci entrará em contato pelo WhatsApp em até 24h para agendar sua consulta de avaliação por {precoFmt}.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-4 text-base font-medium text-primary-foreground transition-all hover:opacity-90 hover:translate-y-[-1px] shadow-[0_12px_40px_-8px_rgba(184,150,90,0.45)]"
            >
              Quero agendar minha avaliação <ArrowRight size={16} />
            </button>
            <p className="text-xs text-muted-foreground mt-5 flex items-center justify-center gap-2">
              <Lock size={12} /> Sigiloso • Dados protegidos pela LGPD
            </p>
          </div>
        </section>

        {/* Footer */}
        <SiteFooter />

      </div>
    </>
  );
}
