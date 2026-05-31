import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, GraduationCap, HeartHandshake, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSiteSettings, youtubeEmbedUrl } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Dr. Luiz Fernando Lorenci — Saúde Sexual Masculina" },
      { name: "description", content: "Conheça o Dr. Luiz Fernando Lorenci, CRM-SC 41096. Atendimento humanizado, ético e sigiloso em saúde sexual masculina." },
      { property: "og:title", content: "Sobre o Dr. Luiz Fernando Lorenci" },
      { property: "og:description", content: "Medicina de verdade: escuta, investigação e tratamento personalizado." },
    ],
  }),
  component: SobrePage,
});

const VALORES = [
  { icon: HeartHandshake, title: "Escuta sem pressa", body: "Cada paciente recebe o tempo necessário para ser ouvido por completo, sem o cronômetro do sistema." },
  { icon: Stethoscope, title: "Diagnóstico investigativo", body: "Antes da prescrição, a investigação. Exames direcionados para encontrar a causa real." },
  { icon: Award, title: "Ética acima de tudo", body: "Sem venda casada, sem comissões. A receita é sua para manipular onde preferir." },
  { icon: GraduationCap, title: "Formação contínua", body: "Atualização constante em andrologia, endocrinologia masculina e medicina sexual." },
];

function SobrePage() {
  const { data: site } = useSiteSettings();
  const medico = site?.medico_nome ?? "Dr. Luiz Fernando Lorenci";
  const crm = site?.crm ?? "CRM-SC 41096";
  const especialidade = site?.especialidade ?? "Saúde Sexual Masculina";
  const fotoPrincipal = site?.foto_principal_url;
  const videoEmbed = youtubeEmbedUrl(site?.video_youtube_url);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-5 pt-20 pb-16">
          <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-4">Sobre o Médico</div>
          <div className="flex flex-col sm:flex-row items-start gap-8">
            {fotoPrincipal ? (
              <img src={fotoPrincipal} alt={medico} className="h-40 w-40 rounded-lg object-cover border border-gold-line shrink-0" />
            ) : (
              <div className="h-40 w-40 rounded-lg bg-gold-dim border border-gold-line flex items-center justify-center shrink-0">
                <Stethoscope className="h-16 w-16 text-gold" />
              </div>
            )}
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl text-cream leading-tight mb-3">{medico}</h1>
              <div className="text-sm text-muted-foreground mb-6">{crm} • {especialidade}</div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Médico dedicado à saúde sexual masculina, com uma abordagem que coloca a escuta, a investigação e o respeito ao paciente no centro do atendimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-b border-border bg-ink2/40">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <blockquote className="border-l-2 border-gold pl-6 mb-10">
            <p className="font-serif text-2xl sm:text-3xl text-cream italic leading-relaxed">
              "Quando foi a última vez que um médico realmente te ouviu? Sem olhar para o relógio. Sem a pressa do sistema. Eu quero, legitimamente, ouvir a sua história."
            </p>
          </blockquote>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Ao longo dos anos de prática clínica, percebi que a medicina padronizada e fria estava deixando muitos homens para trás. A saúde sexual masculina, em particular, virou um balcão de vendas — consultas rápidas, pacotes fechados e medicação supercaraturada empurrada no balcão.
            </p>
            <p>
              Decidi seguir um caminho diferente. Meu foco é oferecer um espaço seguro, sem julgamentos, onde você seja compreendido por completo. A disfunção erétil, a ejaculação precoce e os problemas metabólicos têm tratamento — e ele começa com uma relação de confiança entre médico e paciente.
            </p>
            <p>
              Acredito que o paciente merece a verdade sobre seu corpo, a liberdade de escolher onde manipular a receita e o tempo necessário para entender o que está acontecendo. É assim que pratico medicina.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">Princípios</div>
          <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-12 max-w-2xl leading-tight">
            Os valores que guiam cada <em>atendimento</em>.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALORES.map((v, i) => (
              <div key={i} className="rounded-md border border-border bg-background p-6 hover:border-gold-line transition-colors">
                <v.icon className="h-6 w-6 text-gold mb-3" />
                <h3 className="font-serif text-xl text-cream mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vídeo */}
      {videoEmbed && (
        <section className="border-b border-border bg-ink2/40">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">Mensagem em vídeo</div>
            <h2 className="font-serif text-3xl text-cream mb-8 leading-tight">Conheça meu trabalho</h2>
            <div className="aspect-video rounded-lg overflow-hidden border border-border bg-ink2">
              <iframe src={videoEmbed} className="w-full h-full" allowFullScreen title="Vídeo informativo" />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-5 leading-tight">
            Pronto para uma avaliação <em>de verdade</em>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Agende sua consulta de avaliação por R$ 99. Atendimento sigiloso, sem pressa e sem venda casada.
          </p>
          <Link
            to="/"
            hash="top"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Agendar avaliação <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
