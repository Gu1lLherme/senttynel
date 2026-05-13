import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PlanCard from '@/components/sentinel/PlanCard';

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: 29.90,
    tagline: 'Proteção essencial individual',
    features: [
      'SOS / Botão de pânico',
      'GPS em tempo real',
      'Até 3 contatos de emergência',
      '1 zona segura',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 89.90,
    highlight: true,
    tagline: 'Para quem quer tudo',
    features: [
      'Tudo do Básico',
      'Contatos ilimitados',
      'Zonas seguras ilimitadas',
      'Encontrar dispositivo (toque, localizar, bloquear)',
      'Relatórios mensais em PDF',
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: 149.90,
    tagline: 'Proteja quem você ama',
    features: [
      'Tudo do Premium',
      'Até 6 membros vinculados',
      'Cônjuge, filhos e parentes',
      'Perfil de saúde compartilhado',
      'Cercas geográficas familiares',
      'Suporte prioritário',
    ],
  },
];

export default function Planos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSelect = async (planId) => {
    if (window.self !== window.top) {
      toast({
        title: 'Abra em uma nova aba',
        description: 'O checkout só funciona em uma aba dedicada (não dentro do preview).',
        variant: 'destructive',
      });
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        plan: planId,
        success_url: `${window.location.origin}/configuracoes?status=success`,
        cancel_url:  `${window.location.origin}/planos?status=cancel`,
      });
      const url = res.data?.url;
      if (!url) throw new Error('Não foi possível criar a sessão');
      window.location.href = url;
    } catch (err) {
      toast({ title: 'Erro ao iniciar pagamento', description: err.message, variant: 'destructive' });
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-8 pb-12">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
          style={{ color: '#607090' }}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            style={{ background: '#EBF0F8', color: '#1743B8', border: '1px solid #C4D0E5' }}
          >
            <Shield size={12} />
            Planos SENTINEL
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight" style={{ color: '#0C1A38' }}>
            Escolha sua proteção
          </h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: '#607090' }}>
            Cancele quando quiser. Sem fidelidade. Pagamento seguro via Stripe.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelect}
              loading={loadingPlan === plan.id}
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs" style={{ color: '#8A9FC0' }}>
          <Lock size={12} />
          Pagamento processado com segurança pela Stripe · Cartões aceitos: Visa, Mastercard, Elo
        </div>
      </div>
    </div>
  );
}