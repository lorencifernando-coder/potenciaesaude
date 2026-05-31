import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre o Médico" },
  { to: "/blog", label: "Blog" },
];

export function SiteHeader({ ctaHref = "/#top", onCtaClick }: { ctaHref?: string; onCtaClick?: () => void }) {
  const { data: site } = useSiteSettings();
  const empresa = site?.empresa_nome ?? "LFL Cuidado e Saúde";
  const especialidade = site?.especialidade ?? "Saúde Masculina";
  const cta = site?.header_cta_texto || "Agendar avaliação";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 h-16">
        <Link to="/" className="font-serif text-lg tracking-wide text-gold-l flex items-center gap-2">
          {site?.logo_url ? (
            <img src={site.logo_url} alt={empresa} className="h-8 w-auto" />
          ) : (
            <>LFL <span className="text-muted-foreground text-[0.78em]">{especialidade}</span></>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-muted-foreground hover:text-cream transition-colors"
              activeProps={{ className: "text-cream" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {onCtaClick ? (
          <button
            onClick={onCtaClick}
            className="btn-gold hidden sm:inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium"
          >
            <span>{cta}</span> <ArrowRight size={14} />
          </button>
        ) : (
          <a
            href={ctaHref}
            className="btn-gold hidden sm:inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium"
          >
            <span>{cta}</span> <ArrowRight size={14} />
          </a>
        )}
      </div>
    </header>
  );
}
