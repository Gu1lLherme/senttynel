import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Bell, Users, ArrowRight, Heart, Smartphone, Brain, Sparkles } from 'lucide-react';
import Logo from '@/components/sentinel/Logo';

const features = [
  { icon: Shield, label: 'Detecção de Quedas', desc: 'Sensores inteligentes 24/7' },
  { icon: MapPin, label: 'Localização', desc: 'GPS em tempo real' },
  { icon: Bell, label: 'Alertas SOS', desc: 'Pânico instantâneo' },
  { icon: Users, label: 'Controle Parental', desc: 'Proteja sua família' },
];

const desktopFeatures = [
  { icon: Brain, label: 'IA Contextual', desc: 'Agente analisa sensores e classifica seu estado em tempo real' },
  { icon: Smartphone, label: 'Encontrar Dispositivo', desc: 'Toque alarme, localize ou bloqueie remotamente' },
  { icon: Heart, label: 'Perfil de Saúde', desc: 'Tipo sanguíneo, alergias e medicações em um QR de resgate' },
  { icon: Sparkles, label: 'Cercas inteligentes', desc: 'Saiba quando família chega ou sai de locais críticos' },
];

export default function BemVindo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 md:w-[600px] md:h-[600px] bg-blue-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-red-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* MOBILE LAYOUT (default) */}
      <div className="lg:hidden relative min-h-screen px-6 py-10 flex flex-col max-w-md mx-auto">
        <div className="flex-shrink-0 flex justify-center pt-8">
          <Logo size="xl" />
        </div>

        <div className="flex-shrink-0 text-center mt-8 mb-8">
          <h2 className="text-3xl font-black text-foreground leading-tight">
            Sua segurança em<br />
            <span className="bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">primeiro lugar</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-3 max-w-xs mx-auto">
            Monitoramento inteligente, alertas em tempo real e proteção para você e sua família.
          </p>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 mb-8">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass-card rounded-2xl p-4 flex flex-col items-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-foreground font-bold text-sm">{label}</p>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 space-y-3">
          <button
            onClick={() => navigate('/acesso?mode=signup')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Começar agora
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/acesso?mode=signin')}
            className="w-full py-3.5 rounded-2xl bg-white border border-gray-200 text-foreground font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Já tenho conta
          </button>
          <p className="text-center text-xs text-muted-foreground pt-2">
            🔐 Privacidade por design • Dados locais
          </p>
        </div>
      </div>

      {/* DESKTOP LAYOUT (lg+) */}
      <div className="hidden lg:flex relative min-h-screen max-w-7xl mx-auto px-12 py-10 items-center">
        <div className="grid grid-cols-2 gap-16 w-full items-center">
          {/* Left: hero */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Logo size="md" showText={false} />
              <div>
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 bg-clip-text text-transparent">SENTINEL</h1>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Proteção Inteligente</p>
              </div>
            </div>

            <div>
              <h2 className="text-6xl font-black text-foreground leading-[1.05]">
                Sua segurança<br />em <span className="bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">primeiro lugar</span>
              </h2>
              <p className="text-lg text-muted-foreground mt-6 max-w-lg leading-relaxed">
                Monitoramento inteligente, alertas em tempo real e proteção para você e sua família.
                O SENTINEL transforma seu smartphone em um segurança pessoal 24/7.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/acesso?mode=signup')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:opacity-95 active:scale-[0.98] transition-all"
              >
                Começar agora
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/acesso?mode=signin')}
                className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-foreground font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Já tenho conta
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">🔐 Criptografia ponta-a-ponta</span>
              <span className="flex items-center gap-2">🛡️ Privacidade por design</span>
            </div>
          </div>

          {/* Right: features grid */}
          <div className="grid grid-cols-2 gap-4">
            {desktopFeatures.map(({ icon: Icon, label, desc }, idx) => (
              <div
                key={label}
                className={`glass-card rounded-3xl p-6 flex flex-col gap-3 hover:shadow-xl transition-all ${idx % 2 === 0 ? 'translate-y-4' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-base">{label}</p>
                  <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}