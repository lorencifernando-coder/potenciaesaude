import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Lock,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  FileText,
  MessageCircle,
  Clock,
  Star,
} from "lucide-react";
import { Quiz } from "@/components/Quiz";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSiteSettings, youtubeEmbedUrl } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dr. Luiz Fernando Lorenci — Avaliação para Disfunção Erétil | Sigilo absoluto" },
      { name: "description", content: "Avaliação médica ética e personalizada para disfunção erétil. Investigamos a causa (hormonal, vascular ou emocional) e prescrevemos fórmulas sob medida. Sem venda casada. CRM-SC 41096." },
      { name: "keywords", content: "disfunção erétil, tratamento disfunção erétil, médico urologista, andrologia, testosterona, Lages, Santa Catarina, telemedicina, saúde masculina" },
      { property: "og:title", content: "Recupere sua Potência — Avaliação médica ética" },
      { property: "og:description", content: "Investigação real da causa. Receituário personalizado, sem pacotes abusivos. Sigilo absoluto." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: Landing,
});

const TESTIMONIALS = [
  { quote: "Ótimo profissional, acima de tudo humano. Um dos melhores que já consultei.", author: "Paciente verificado" },
  { quote: "Me lembra os médicos de antigamente — calidez humana, atenção e conhecimento.", author: "Paciente verificado" },
  { quote: "Excelente profissional. Seu cuidado e sua escuta são de muita qualidade.", author: "Paciente verificado" },
  { quote: "Sabe transmitir tranquilidade em momentos em que o paciente está vulnerável.", author: "Paciente verificado" },
];

const COMMITMENTS = [
  { title: "Diagnóstico investigativo", body: "Analisamos exames de verdade. Hormonal? Vascular? Emocional? Descobrimos juntos a raiz — sem promessas vagas ou medicamentos milagrosos." },
  { title: "Liberdade de escolha", body: "Você recebe a receita e manipula na farmácia da sua confiança. Sem comissões. Sem custos ocultos. Sem assinatura mensal. Sem vendas casadas." },
  { title: "Foco na reabilitação", body: "O objetivo não é deixar você dependente de remédios — é restaurar sua função sexual e sua saúde como um todo, de forma sustentável e atualizada." },
  { title: "Acompanhamento contínuo", body: "Direito a consulta de retorno, prontuário organizado e progressão real entre os tratamentos. Cada caso desafiador é levado a sério." },
];

const SINTOMAS = [
  "Você perdeu a confiança nos momentos íntimos",
  "A ereção falha justamente quando mais importa",
  "Está evitando situações de intimidade por medo de falhar",
  "Já tentou medicações genéricas sem resultado consistente",
  "Sente que perdeu libido, energia ou disposição",
  "Tem dúvidas se a causa é física, hormonal ou emocional",
];

const INCLUSO = [
  { icon: Stethoscope, t: "Consulta médica completa", b: "Anamnese aprofundada, sem pressa, em ambiente sigiloso." },
  { icon: FlaskConical, t: "Pedido de exames direcionados", b: "Hormonal, vascular e metabólico — só o que realmente importa." },
  { icon: FileText, t: "Receita personalizada", b: "Fórmula manipulada para o seu caso. Você escolhe a farmácia." },
  { icon: MessageCircle, t: "Acompanhamento por WhatsApp", b: "Suporte para dúvidas pontuais após a consulta." },
  { icon: Clock, t: "Consulta de retorno inclusa", b: "Prontuário organizado e progressão real entre os tratamentos. Cada caso acompanhado." },
];

const STEPS = [
  { n: "01", t: "Agendamento confidencial", b: "Preencha o questionário em 2 minutos. Recebemos sua solicitação com total sigilo." },
  { n: "02", t: "Consulta de avaliação", b: "Conversa franca sobre seu histórico, estilo de vida e queixas. Sem julgamentos." },
  { n: "03", t: "Investigação clínica", b: "Solicitamos os exames certos para identificar a causa real — hormonal, vascular ou emocional." },
  { n: "04", t: "Tratamento sob medida", b: "Prescrição de fórmulas específicas para você. Receita livre — farmácia à sua escolha." },
];

const FAQ = [
  {
    q: "A consulta é presencial ou online?",
    a: "Você pode escolher. Atendemos presencialmente em Lages/SC e também por telemedicina para todo o Brasil, com a mesma qualidade e sigilo.",
  },
  {
    q: "Por que o valor é diferente das clínicas grandes?",
    a: "Porque cobramos apenas pela consulta médica — não embutimos no preço a medicação. Outras clínicas faturam vendendo fórmulas próprias com margem alta. Aqui, você paga a consulta e manipula onde quiser.",
  },
  {
    q: "E se eu já tomei sildenafila/tadalafila sem efeito?",
    a: "Esse é justamente um dos motivos para investigar a causa. Muitos casos não respondem a medicação padrão porque a raiz é hormonal, vascular ou psicológica. Vamos descobrir.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Sim. Toda informação é tratada com sigilo médico absoluto e proteção LGPD. Seu nome jamais aparece em listas ou comunicações comerciais.",
  },
  {
    q: "Quanto tempo leva para ver resultado?",
    a: "Depende da causa identificada. A maioria dos pacientes percebe melhora em 4 a 8 semanas após iniciar o tratamento correto.",
  },
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
        <SiteHeader onCtaClick={() => setOpen(true)} />

        {/* Hero */}
        <section id="top" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(184,150,90,0.18),transparent_70%)]" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,transparent,rgba(184,150,90,0.10),transparent)] blur-3xl" />
          </div>

          <div className="mx-auto max-w-3xl px-5 pt-20 pb-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-line bg-gold-dim px-3 py-1 text-[11px] uppercase tracking-widest text-gold-l mb-8">
              <ShieldCheck size={12} /> Sigilo absoluto • {crm}
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
                className="btn-gold group inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-sm font-medium"
              >
                <span>Agendar avaliação — {precoFmt}</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#como" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-3">
                Como funciona
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Lock size={12} /> 100% confidencial</span>
              <span className="inline-flex items-center gap-1.5"><Check size={12} /> Sem venda casada</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={12} /> Resposta em até 24h</span>
            </div>
          </div>
        </section>

        {/* Você se identifica? — Qualificação */}
        <section className="border-t border-border bg-ink2/40">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-4">Você se identifica?</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream max-w-2xl mb-10 leading-tight">
              Se um destes pontos faz sentido para você, é hora de uma <em>avaliação séria</em>.
            </h2>

            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {SINTOMAS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-md border border-border bg-background p-5 hover:border-gold-line transition-colors"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-dim border border-gold-line">
                    <Check size={11} className="text-gold-l" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{s}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground italic">
              A disfunção erétil é o sintoma — quase nunca a doença. Tratar só o sintoma é apagar o alarme sem entender o incêndio.
            </p>
          </div>
        </section>

        {/* Problem vs Solution — Compromissos */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-4">A indústria falhou com você</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream max-w-2xl mb-6 leading-tight">
              A saúde sexual masculina virou <em>balcão de vendas</em>. Aqui é diferente.
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-12 leading-relaxed">
              Muitos homens acabam em clínicas que exploram a fragilidade do momento — consultas rápidas, pacotes fechados e medicação supercarafurada empurrada no balcão. O meu compromisso é o oposto disso.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <section className="border-t border-border bg-ink2/40">
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
              Decidi seguir um caminho diferente da medicina padronizada e fria. Aqui fazemos ciência — de forma atualizada, atenta e buscando restaurar a sua saúde como um todo. Sem promessas vagas, medicamentos milagrosos ou vendas casadas. A ereção e o desejo são os termômetros da saúde masculina: quando estão em ordem, o resto do corpo também tende a estar.
            </p>

            {videoEmbed && (
              <div className="mt-10 aspect-video rounded-lg overflow-hidden border border-border bg-ink2">
                <iframe src={videoEmbed} className="w-full h-full" allowFullScreen title="Vídeo informativo" />
              </div>
            )}
          </div>
        </section>

        {/* O que está incluso na avaliação — Ancoragem de valor */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">O que você recebe</div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl text-cream max-w-xl leading-tight">
                Tudo o que está incluso na sua <em>avaliação</em>.
              </h2>
              <div className="text-right">
                <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-1">Investimento único</div>
                <div className="font-serif text-4xl text-gold-l">{precoFmt}</div>
                <div className="text-xs text-muted-foreground mt-1">Sem mensalidades. Sem pacotes.</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {INCLUSO.map(({ icon: Icon, t, b }, i) => (
                <div key={i} className="flex gap-4 rounded-md border border-border bg-background p-6 hover:border-gold-line transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-dim border border-gold-line">
                    <Icon size={18} className="text-gold-l" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-cream mb-1">{t}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="btn-gold group inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-sm font-medium"
              >
                <span>Agendar minha avaliação por {precoFmt}</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
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
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} size={12} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-foreground leading-relaxed mb-3">"{t.quote}"</blockquote>
                  <figcaption className="text-xs text-muted-foreground">— {t.author}</figcaption>
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
              Quatro passos para sua <em>reabilitação</em>.
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

        {/* FAQ — Quebra de objeções */}
        <section className="border-t border-border bg-ink2/40">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">Dúvidas frequentes</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-10 leading-tight">
              Antes de agendar, você provavelmente quer saber:
            </h2>

            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-md border border-border bg-background p-5 open:border-gold-line transition-colors"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                    <span className="font-serif text-lg text-cream leading-snug">{item.q}</span>
                    <span className="mt-1 text-gold-l text-xl leading-none shrink-0 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-gradient-to-b from-ink2 to-background">
          <div className="mx-auto max-w-3xl px-5 py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-line bg-gold-dim px-3 py-1 text-[11px] uppercase tracking-widest text-gold-l mb-6">
              <HeartPulse size={12} /> Próximo passo
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-cream mb-5 leading-tight">
              Sua avaliação começa em <em>2 minutos</em>.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Preencha o questionário confidencial. Entraremos em contato pelo WhatsApp em até 24h para confirmar sua consulta de avaliação por {precoFmt}.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="btn-gold inline-flex items-center gap-2 rounded-md px-8 py-4 text-base font-medium"
            >
              <span>Quero agendar minha avaliação</span> <ArrowRight size={16} />
            </button>
            <p className="text-xs text-muted-foreground mt-5 flex items-center justify-center gap-2">
              <Lock size={12} /> Sigiloso • Dados protegidos pela LGPD • {crm}
            </p>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
