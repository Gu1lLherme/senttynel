import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import Logo from '@/components/sentinel/Logo';
import { useToast } from '@/components/ui/use-toast';

export default function Acesso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signin' ? 'signin' : 'signup';
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // If already authenticated, skip login
  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) navigate('/app');
    }).catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast({ title: 'Preencha email e senha', variant: 'destructive' });
      return;
    }
    if (mode === 'signup' && !form.name) {
      toast({ title: 'Informe seu nome', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // Save form data locally so we can complete the profile after Base44 login
      sessionStorage.setItem('sentinel_pending_profile', JSON.stringify({
        name: form.name, mode,
      }));
      // Redirects to Base44 login (transparent for the user)
      base44.auth.redirectToLogin('/app');
    } catch (err) {
      toast({ title: 'Erro ao acessar', description: err.message, variant: 'destructive' });
      setSubmitting(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 px-6 py-8 flex flex-col max-w-md mx-auto">
      {/* Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="relative flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="relative flex justify-center mb-6">
        <Logo size="lg" />
      </div>

      <div className="relative bg-gray-100 p-1 rounded-2xl flex mb-6">
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            isSignup ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Criar conta
        </button>
        <button
          onClick={() => setMode('signin')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            !isSignup ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Entrar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-4 flex-1">
        {isSignup && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Nome completo
            </label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Senha
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 hover:opacity-95 active:scale-[0.98] transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {isSignup ? 'Criar minha conta' : 'Entrar no SENTINEL'}
        </button>

        {isSignup && (
          <p className="text-center text-xs text-muted-foreground">
            Ao criar conta, você concorda com os termos de uso e política de privacidade.
          </p>
        )}
      </form>

      <div className="relative pt-4 border-t border-gray-200 mt-6">
        <p className="text-center text-xs text-muted-foreground">
          🔐 Suas credenciais são protegidas por criptografia
        </p>
      </div>
    </div>
  );
}