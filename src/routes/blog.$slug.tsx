import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Quiz } from "@/components/Quiz";
import { BLOG_POSTS, getPostBySlug, type BlogPost } from "@/data/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Artigo não encontrado" }] };
    return {
      meta: [
        { title: `${post.title} — Blog Dr. Luiz Fernando Lorenci` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: post.cover },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: post.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="font-serif text-3xl text-cream mb-3">Artigo não encontrado</h1>
        <p className="text-muted-foreground mb-6">O artigo que você procura não existe ou foi movido.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-gold-l hover:opacity-80">
          <ArrowLeft size={14} /> Voltar ao blog
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-cream mb-3">Erro ao carregar artigo</h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: BlogPostPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function PostBody({ post }: { post: BlogPost }) {
  return (
    <div className="space-y-6">
      {post.content.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i} className="font-serif text-2xl sm:text-3xl text-cream mt-10 mb-2 leading-tight">{block.text}</h2>;
          case "h3":
            return <h3 key={i} className="font-serif text-xl text-cream mt-6 mb-2">{block.text}</h3>;
          case "p":
            return <p key={i} className="text-base text-foreground/90 leading-relaxed">{block.text}</p>;
          case "ul":
            return (
              <ul key={i} className="space-y-2 pl-5 list-disc marker:text-gold">
                {block.items.map((it, j) => (
                  <li key={j} className="text-base text-foreground/90 leading-relaxed">{it}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l-2 border-gold pl-5 my-8">
                <p className="font-serif text-xl text-cream italic leading-relaxed">{block.text}</p>
              </blockquote>
            );
        }
      })}
    </div>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Quiz open={quizOpen} onClose={() => setQuizOpen(false)} />
      <SiteHeader onCtaClick={() => setQuizOpen(true)} />

      <article>
        {/* Hero */}
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-5 pt-12 pb-10">
            <Link to="/blog" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold-l mb-6">
              <ArrowLeft size={12} /> Blog
            </Link>
            <div className="eyebrow mb-4">{post.category}</div>
            <h1 className="font-serif text-4xl sm:text-5xl text-cream leading-[1.1] mb-5">{post.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatDate(post.date)}</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {post.readingTime}</span>
            </div>
          </div>
          <div className="mx-auto max-w-5xl px-5 pb-12">
            <div className="aspect-[16/8] overflow-hidden rounded-lg border border-border bg-ink2">
              <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Body */}
        <section>
          <div className="mx-auto max-w-2xl px-5 py-16">
            <PostBody post={post} />
          </div>
        </section>

        {/* CTA */}
        <section className="border-y border-border bg-tint">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center">
            <div className="eyebrow mb-4">Avaliação médica</div>
            <h2 className="font-serif text-2xl sm:text-3xl text-cream mb-3 leading-tight">
              Quer uma avaliação <em>personalizada</em>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-7 leading-relaxed">
              Conteúdo de blog informa, mas não substitui consulta. Agende uma avaliação sigilosa por R$ 99.
            </p>
            <button
              type="button"
              onClick={() => setQuizOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:translate-y-[-1px] shadow-cta"
            >
              Iniciar avaliação <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <div className="mx-auto max-w-5xl px-5 py-20">
              <div className="eyebrow mb-6">Continue lendo</div>
              <div className="grid md:grid-cols-2 gap-6">
                {related.map((p) => (
                  <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group">
                    <div className="card card-top-line bg-background overflow-hidden rounded-md">
                      <div className="aspect-[16/9] overflow-hidden bg-ink2">
                        <img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-5">
                        <div className="eyebrow mb-2">{p.category}</div>
                        <h3 className="font-serif text-lg text-cream group-hover:text-gold-l transition-colors">{p.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <SiteFooter />
    </div>
  );
}
