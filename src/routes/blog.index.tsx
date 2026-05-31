import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Quiz } from "@/components/Quiz";
import { BLOG_POSTS } from "@/data/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Saúde Sexual Masculina | Dr. Luiz Fernando Lorenci" },
      { name: "description", content: "Conteúdo médico sobre disfunção erétil, ejaculação precoce, obesidade e síndrome metabólica. Informação séria, sem alarmismo." },
      { property: "og:title", content: "Blog — Saúde Sexual Masculina" },
      { property: "og:description", content: "Educação em saúde masculina por um médico, sem sensacionalismo." },
    ],
  }),
  component: BlogIndex,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function BlogIndex() {
  const [featured, ...rest] = BLOG_POSTS;
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Quiz open={quizOpen} onClose={() => setQuizOpen(false)} />
      <SiteHeader onCtaClick={() => setQuizOpen(true)} />

      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 pt-20 pb-12">
          <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-4">Blog</div>
          <h1 className="font-serif text-4xl sm:text-5xl text-cream leading-tight mb-4 max-w-3xl">
            Informação médica clara sobre o que <em>realmente importa</em>.
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Conteúdo escrito por um médico para homens que querem entender o próprio corpo — sem promessas mágicas, sem alarmismo.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="border-b border-border bg-ink2/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <Link to="/blog/$slug" params={{ slug: featured.slug }} className="group block">
            <article className="grid md:grid-cols-2 gap-8 items-center">
              <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-ink2">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">
                  Destaque • {featured.category}
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-cream leading-tight mb-4 group-hover:text-gold-l transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-5">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                  <span>{formatDate(featured.date)}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {featured.readingTime}</span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm text-gold-l">
                  Ler artigo <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </article>
          </Link>
        </div>
      </section>

      {/* Feed */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-8">Todos os artigos</div>
          <div className="grid md:grid-cols-2 gap-6">
            {rest.map((post) => (
              <Link key={post.slug} to="/blog/$slug" params={{ slug: post.slug }} className="group">
                <article className="rounded-lg border border-border bg-background overflow-hidden hover:border-gold-line transition-colors h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden bg-ink2">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3">{post.category}</div>
                    <h3 className="font-serif text-xl text-cream leading-tight mb-3 group-hover:text-gold-l transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(post.date)}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {post.readingTime}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Avaliação */}
      <section className="border-b border-border bg-ink2/40">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-4">Avaliação médica</div>
          <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-4 leading-tight">
            Pronto para uma avaliação <em>personalizada</em>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-7 leading-relaxed">
            Responda ao questionário sigiloso e agende sua consulta por R$ 99. Investigação real da causa, sem pacotes abusivos.
          </p>
          <button
            type="button"
            onClick={() => setQuizOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Iniciar avaliação <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
