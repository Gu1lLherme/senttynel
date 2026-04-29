import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Bell, Users, ArrowRight } from 'lucide-react';
import Logo from '@/components/sentinel/Logo';

const features = [
  { icon: Shield, label: 'Detecção de Quedas', desc: 'Sensores inteligentes 24/7' },
  { icon: MapPin, label: 'Localização', desc: 'GPS em tempo real' },
  { icon: Bell, label: 'Alertas SOS', desc: 'Pânico instantâneo' },
  { icon: Users, label: 'Controle Parental', desc: 'Proteja sua família' },
];

export default function BemVindo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 px-6 py-10 flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Logo */}
      <div className="relative flex-shrink-0 flex justify-center pt-8">
        <Logo size="xl" />
      </div>

      {/* Title */}
      <div className="relative flex-shrink-0 text-center mt-8 mb-8">
        <h2 className="text-3xl font-black text-foreground leading-tight">
          Sua segurança em<br />
          <span className="bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">primeiro lugar</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-3 max-w-xs mx-auto">
          Monitoramento inteligente, alertas em tempo real e proteção para você e sua família.
        </p>
      </div>

      {/* Features grid */}
      <div className="relative flex-1 grid grid-cols-2 gap-3 mb-8">
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

      {/* CTA buttons */}
      <div className="relative flex-shrink-0 space-y-3">
        <button
          onClick={() => navigate('/acesso')}
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
  );
}