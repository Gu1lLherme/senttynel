import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Bell, Users, ArrowRight, Heart, Smartphone, Brain } from 'lucide-react';
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
  { icon: MapPin, label: 'Cercas inteligentes', desc: 'Saiba quando família chega ou sai de locais críticos' },
];

export default function BemVindo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden min-h-screen px-6 py-10 flex flex-col max-w-md mx-auto">
        <div className="flex-shrink-0 flex justify-center pt-4">
          <Logo size="xl" />
        </div>

        <div className="flex-shrink-0 text-center mt-8 mb-8">
          <h2 className="font-display text-4xl leading-tight" style={{ color: '#0C1A38' }}>
            Sua segurança<br />em primeiro lugar
          </h2>
          <p className="text-sm mt-3 max-w-xs mx-auto" style={{ color: '#607090' }}>
            Monitoramento inteligente, alertas em tempo real e proteção para você e sua família.
          </p>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 mb-8">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex flex-col items-start gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/10 hover:border-blue-300"
              style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: '#1743B8' }}
              >
                <Icon size={18} style={{ color: '#FFFFFF' }} strokeWidth={2.25} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#0C1A38' }}>{label}</p>
                <p className="text-xs" style={{ color: '#607090' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 space-y-3">
          <button
            onClick={() => navigate('/acesso?mode=signup')}
            className="group w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/25 hover:-translate-y-0.5"
            style={{ background: '#1743B8', color: '#FFFFFF' }}
          >
            Começar agora
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('/acesso?mode=signin')}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all duration-300 hover:border-blue-300 hover:shadow-md"
            style={{ background: '#FFFFFF', border: '1px solid #C4D0E5', color: '#0C1A38' }}
          >
            Já tenho conta
          </button>
          <p className="text-center text-xs pt-2" style={{ color: '#8A9FC0' }}>
            🔐 Privacidade por design · Dados locais
          </p>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex min-h-screen max-w-7xl mx-auto px-12 py-10 items-center">
        <div className="grid grid-cols-2 gap-16 w-full items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Logo size="md" showText={false} />
              <div>
                <h1 className="font-display text-2xl tracking-tight" style={{ color: '#0C1A38' }}>SENTINEL</h1>
                <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#607090' }}>Proteção Inteligente</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-6xl leading-[1.05]" style={{ color: '#0C1A38' }}>
                Sua segurança<br />em primeiro lugar
              </h2>
              <p className="text-lg mt-6 max-w-lg leading-relaxed" style={{ color: '#607090' }}>
                Monitoramento inteligente, alertas em tempo real e proteção para você e sua família.
                O SENTINEL transforma seu smartphone em um segurança pessoal 24/7.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/acesso?mode=signup')}
                className="group px-8 py-4 rounded-2xl font-bold flex items-center gap-2 active:scale-[0.98] transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/25 hover:-translate-y-0.5"
                style={{ background: '#1743B8', color: '#FFFFFF' }}
              >
                Começar agora
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/acesso?mode=signin')}
                className="px-8 py-4 rounded-2xl font-semibold active:scale-[0.98] transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                style={{ background: '#FFFFFF', border: '1px solid #C4D0E5', color: '#0C1A38' }}
              >
                Já tenho conta
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm" style={{ color: '#607090' }}>
              <span>🔐 Criptografia ponta-a-ponta</span>
              <span>🛡️ Privacidade por design</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {desktopFeatures.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-300 cursor-default"
                style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: '#1743B8' }}
                >
                  <Icon size={22} style={{ color: '#FFFFFF' }} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="font-bold text-base" style={{ color: '#0C1A38' }}>{label}</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#607090' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}