import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, Loader2, Shield, MapPin, Bell, Users } from 'lucide-react';
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
      sessionStorage.setItem('sentinel_pending_profile', JSON.stringify({ name: form.name, mode }));
      base44.auth.redirectToLogin('/app');
    } catch (err) {
      toast({ title: 'Erro ao acessar', description: err.message, variant: 'destructive' });
      setSubmitting(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        {/* LEFT: marketing panel (desktop only) — sólido, sem gradientes */}
        <aside className="hidden lg:flex flex-col justify-between p-12 text-white" style={{ background: '#1743B8' }}>
          <Logo size="md" showText={false} />

          <div className="space-y-8">
            <div>
              <h1 className="font-display text-5xl leading-tight text-white">
                Proteção que<br />não dorme.
              </h1>
              <p className="text-lg mt-4 max-w-md leading-relaxed" style={{ color: '#DDE6FA' }}>
                Junte-se a milhares de famílias que confiam no SENTINEL para monitorar e proteger quem importa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { icon: Shield, label: 'Detecção 24/7' },
                { icon: MapPin, label: 'GPS em tempo real' },
                { icon: Bell, label: 'Alertas SOS' },
                { icon: Users, label: 'Controle Parental' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <Icon size={16} className="text-white flex-shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs" style={{ color: '#DDE6FA' }}>
            🔐 Criptografia ponta-a-ponta · Privacidade por design
          </div>
        </aside>

        {/* RIGHT: form */}
        <main className="px-6 py-8 lg:px-16 lg:py-12 flex flex-col max-w-md mx-auto lg:max-w-none lg:w-full lg:justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors self-start"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <div className="lg:hidden flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-black text-foreground">
              {isSignup ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSignup ? 'Comece a proteger você e sua família em minutos.' : 'Acesse sua conta para continuar protegido.'}
            </p>
          </div>

          <div className="bg-gray-100 p-1 rounded-2xl flex mb-6 lg:max-w-md">
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

          <form onSubmit={handleSubmit} className="space-y-4 lg:max-w-md">
            {isSignup && (
              <Field label="Nome completo" icon={UserIcon}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </Field>
            )}

            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </Field>

            <Field label="Senha" icon={Lock}>
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
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-white font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: '#1743B8' }}
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

          <div className="pt-4 border-t border-gray-200 mt-6 lg:max-w-md">
            <p className="text-center text-xs text-muted-foreground">
              🔐 Suas credenciais são protegidas por criptografia
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}