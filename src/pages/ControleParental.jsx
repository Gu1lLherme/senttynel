import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart, Baby, Users, Shield, ChevronRight, UserPlus, Smartphone, Eye } from 'lucide-react';
import GroupSection from '@/components/familia/GroupSection';

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
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Eye size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Família</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Sua Rede</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral de quem está sob proteção
        </p>
      </div>

      {/* Quick actions — 2 atalhos para gestão */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => navigate('/familia/cadastrar')}
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col items-start gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <UserPlus size={18} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">Cadastrar</p>
            <p className="text-blue-100 text-[11px]">Vincular pessoas</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/familia/dispositivos')}
          className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white flex flex-col items-start gap-2 shadow-lg shadow-red-500/20 active:scale-[0.98] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Smartphone size={18} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">Dispositivos</p>
            <p className="text-red-100 text-[11px]">Localizar e gerenciar</p>
          </div>
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-bold text-sm mb-1">Visualização da rede</p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Toque em um membro para ver perfil de saúde, contatos de emergência e dados compartilhados.
            </p>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatBox label="Cônjuge" value={groups.conjuge.length} color="pink" />
        <StatBox label="Filhos" value={groups.filho.length} color="blue" />
        <StatBox label="Parentes" value={groups.parente.length} color="amber" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <p className="text-foreground font-semibold">Nenhuma pessoa vinculada</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Comece cadastrando alguém da sua família
          </p>
          <button
            onClick={() => navigate('/familia/cadastrar')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            Cadastrar agora
          </button>
        </div>
      ) : (
        <>
          <GroupSection
            icon={Heart}
            title="Cônjuge"
            subtitle="Parceiro(a) ou companheiro(a)"
            color="pink"
            members={groups.conjuge}
            hideActions
          />
          <GroupSection
            icon={Baby}
            title="Filhos"
            subtitle="Crianças e adolescentes"
            color="blue"
            members={groups.filho}
            hideActions
          />
          <GroupSection
            icon={Users}
            title="Parentes"
            subtitle="Avós, pais idosos, irmãos, tios"
            color="amber"
            members={groups.parente}
            hideActions
          />
        </>
      )}

      <div className="mt-6 p-3 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-blue-700 text-xs font-semibold mb-1">🔐 Privacidade total</p>
        <p className="text-blue-600/70 text-xs">
          Cada pessoa vê o que está sendo compartilhado e pode revogar o vínculo a qualquer momento.
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  const colors = {
    pink: 'bg-pink-50 text-pink-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className={`p-3 rounded-2xl ${colors[color]} text-center`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
    </div>
  );
}