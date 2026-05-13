import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart, Baby, Users, Shield, UserPlus, Smartphone, Eye } from 'lucide-react';
import GroupSection from '@/components/familia/GroupSection';
import PageHeader from '@/components/sentinel/PageHeader';

export default function ControleParental() {
  const navigate = useNavigate();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['parental-links'],
    queryFn: () => base44.entities.ParentalLink.list('-created_date'),
  });

  const groups = {
    conjuge: links.filter(l => l.group === 'conjuge'),
    filho: links.filter(l => !l.group || l.group === 'filho'),
    parente: links.filter(l => l.group === 'parente'),
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-24 max-w-md mx-auto">
      <PageHeader
        icon={Eye}
        label="Família"
        title="Sua Rede"
        subtitle="Visão geral de quem está sob proteção"
      />

      {/* Quick actions — sólidos, sem gradiente */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <QuickAction
          onClick={() => navigate('/familia/cadastrar')}
          icon={UserPlus}
          title="Cadastrar"
          subtitle="Vincular pessoas"
        />
        <QuickAction
          onClick={() => navigate('/familia/dispositivos')}
          icon={Smartphone}
          title="Dispositivos"
          subtitle="Localizar e gerenciar"
        />
      </div>

      {/* Info banner */}
      <div
        className="mb-5 p-4 rounded-2xl"
        style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
      >
        <div className="flex items-start gap-3">
          <Shield size={18} style={{ color: '#1743B8' }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm mb-1" style={{ color: '#0C1A38' }}>Visualização da rede</p>
            <p className="text-xs leading-relaxed" style={{ color: '#607090' }}>
              Toque em um membro para ver perfil de saúde, contatos de emergência e dados compartilhados.
            </p>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatBox label="Cônjuge" value={groups.conjuge.length} />
        <StatBox label="Filhos" value={groups.filho.length} />
        <StatBox label="Parentes" value={groups.parente.length} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#EBF0F8' }} />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <p className="font-semibold" style={{ color: '#0C1A38' }}>Nenhuma pessoa vinculada</p>
          <p className="text-sm mt-1 mb-4" style={{ color: '#607090' }}>
            Comece cadastrando alguém da sua família
          </p>
          <button
            onClick={() => navigate('/familia/cadastrar')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition"
            style={{ background: '#1743B8', color: '#FFFFFF' }}
          >
            Cadastrar agora
          </button>
        </div>
      ) : (
        <>
          <GroupSection icon={Heart} title="Cônjuge"  subtitle="Parceiro(a) ou companheiro(a)" color="pink"  members={groups.conjuge} hideActions />
          <GroupSection icon={Baby}  title="Filhos"   subtitle="Crianças e adolescentes"        color="blue"  members={groups.filho}   hideActions />
          <GroupSection icon={Users} title="Parentes" subtitle="Avós, pais idosos, irmãos, tios" color="amber" members={groups.parente} hideActions />
        </>
      )}

      <div
        className="mt-6 p-3 rounded-2xl"
        style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: '#0C1A38' }}>🔐 Privacidade total</p>
        <p className="text-xs" style={{ color: '#607090' }}>
          Cada pessoa vê o que está sendo compartilhado e pode revogar o vínculo a qualquer momento.
        </p>
      </div>
    </div>
  );
}

function QuickAction({ onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-2xl flex flex-col items-start gap-2 active:scale-[0.98] transition"
      style={{ background: '#1743B8', color: '#FFFFFF' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-left">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-[11px]" style={{ color: '#DDE6FA' }}>{subtitle}</p>
      </div>
    </button>
  );
}

function StatBox({ label, value }) {
  return (
    <div
      className="p-3 rounded-2xl text-center"
      style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
    >
      <p className="font-display text-2xl" style={{ color: '#0C1A38' }}>{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#607090' }}>{label}</p>
    </div>
  );
}