import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login Administrador — LFL Saúde" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password: pwd,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setMsg("Cadastro criado. Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Lock className="mx-auto text-gold mb-3" size={28} />
          <h1 className="font-serif text-2xl text-cream">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Dr. Luiz Fernando Lorenci</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full bg-ink2 border border-border rounded-md px-3 py-2.5 text-sm" type="email" required placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full bg-ink2 border border-border rounded-md px-3 py-2.5 text-sm" type="password" required minLength={6} placeholder="Senha" value={pwd} onChange={e => setPwd(e.target.value)} />
          {msg && <p className="text-xs text-destructive">{msg}</p>}
          <button disabled={loading} className="w-full rounded-md bg-gold px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
          <button type="button" onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} className="w-full text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Primeiro acesso? Criar conta de administrador" : "Já tem conta? Entrar"}
          </button>
        </form>
        <p className="text-[11px] text-muted-foreground mt-8 text-center">
          Acesso restrito ao Dr. Lorenci ({"adm@lflcuidadoesaude.com.br"}).
        </p>
      </div>
    </div>
  );
}
