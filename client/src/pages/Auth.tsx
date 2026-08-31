import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { destinationForUser, resetPassword, signIn, signUp } from "@/lib/supabase";

export default function Auth() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const change = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password.length < 8) return toast.error("A senha precisa ter pelo menos 8 caracteres.");
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await signIn(form.email, form.password);
        if (error) throw error;
        toast.success("Login realizado com sucesso.");
        const destination = await destinationForUser(data.user.id);
        if (destination.endsWith(".html")) location.href = destination; else navigate(destination);
      } else {
        if (form.name.trim().length < 2 || form.phone.replace(/\D/g, "").length < 10) return toast.error("Informe nome e WhatsApp válidos.");
        const { data, error } = await signUp(form);
        if (error) throw error;
        if (!data.session) { toast.success("Cadastro criado. Confirme seu e-mail para entrar."); setMode("login"); }
        else navigate("/minha-conta");
      }
    } catch (error: any) { toast.error(error.message || "Não foi possível autenticar."); }
    finally { setLoading(false); }
  };
  const forgot = async () => {
    if (!form.email) return toast.warning("Informe seu e-mail primeiro.");
    try { const { error } = await resetPassword(form.email); if (error) throw error; toast.success("Enviamos as instruções para seu e-mail."); }
    catch (error: any) { toast.error(error.message || "Falha ao solicitar nova senha."); }
  };
  return <main className="account-page"><section className="auth-shell shell"><button className="back-link" onClick={() => navigate("/")}><ArrowLeft size={15} /> Voltar à loja</button><div className="auth-card"><div className="auth-card__intro"><span className="auth-icon"><LockKeyhole size={22} /></span><p className="eyebrow">Área segura</p><h1>{mode === "login" ? "Entre na sua conta" : "Crie sua conta"}</h1><p>Acompanhe pedidos, mantenha seus dados atualizados e consulte seus pontos.</p></div><div className="auth-tabs"><button className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>Entrar</button><button className={mode === "cadastro" ? "is-active" : ""} onClick={() => setMode("cadastro")}>Cadastrar</button></div><form className="auth-form" onSubmit={submit}>{mode === "cadastro" && <><label><span>Nome completo</span><div><UserRound size={17} /><input value={form.name} onChange={change("name")} required /></div></label><label><span>WhatsApp com DDD</span><div><Phone size={17} /><input value={form.phone} onChange={change("phone")} inputMode="tel" required /></div></label></>}<label><span>E-mail</span><div><Mail size={17} /><input value={form.email} onChange={change("email")} type="email" autoComplete="email" required /></div></label><label><span>Senha</span><div><LockKeyhole size={17} /><input value={form.password} onChange={change("password")} type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Exibir senha">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{mode === "login" && <button className="forgot-link" type="button" onClick={forgot}>Esqueci minha senha</button>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar minha conta"}</button></form></div></section></main>;
}
