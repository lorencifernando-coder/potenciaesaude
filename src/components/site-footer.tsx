import { Mail, MessageCircle, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function SiteFooter() {
  const { data: site } = useSiteSettings();
  const empresa = site?.empresa_nome ?? "LFL Cuidado e Saúde";
  const medico = site?.medico_nome ?? "Dr. Luiz Fernando Lorenci";
  const crm = site?.crm ?? "CRM-SC 41096";
  const especialidade = site?.especialidade ?? "Saúde Masculina";
  const telefone = site?.telefone ?? "(49) 99931-8583";
  const whatsapp = site?.whatsapp ?? "5549999318583";
  const email = site?.email_contato ?? "adm@lflcuidadoesaude.com.br";
  const enderecoCidade = [site?.cidade, site?.estado].filter(Boolean).join(" - ");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-5xl px-5 py-12 grid sm:grid-cols-2 gap-8">
        <div>
          <div className="font-serif text-xl text-gold-l mb-2">{medico}</div>
          <div className="text-sm text-muted-foreground">{crm} • {especialidade}</div>
          <div className="text-xs text-muted-foreground mt-3 max-w-sm">
            {site?.footer_texto || site?.footer_aviso_legal || "Atendimento sigiloso e humanizado."}
          </div>
          {enderecoCidade && <div className="text-xs text-muted-foreground mt-2">{enderecoCidade}</div>}
        </div>
        <div className="space-y-2 text-sm">
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} className="flex items-center gap-2 text-muted-foreground hover:text-gold-l transition-colors">
              <MessageCircle size={14} /><span>WhatsApp {telefone}</span>
            </a>
          )}
          {telefone && (
            <a href={`tel:+${(whatsapp ?? telefone).replace(/\D/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-gold-l transition-colors">
              <Phone size={14} /><span>{telefone}</span>
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-muted-foreground hover:text-gold-l transition-colors">
              <Mail size={14} /><span>{email}</span>
            </a>
          )}
          {site?.footer_links && site.footer_links.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-3 text-xs">
              {site.footer_links.map((l, i) => (
                <a key={i} href={l.href} className="text-muted-foreground hover:text-gold-l">{l.label}</a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {empresa} — Todos os direitos reservados.</span>
          <span>{crm}</span>
        </div>
      </div>
    </footer>
  );
}
