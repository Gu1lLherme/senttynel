import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Baby, Users, Shield, ChevronRight, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import GroupSection from '@/components/familia/GroupSection';
import AddMemberDialog from '@/components/familia/AddMemberDialog';

export default function ControleParental() {
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['parental-links'],
    queryFn: () => base44.entities.ParentalLink.list('-created_date'),
  });

  const createLink = useMutation({
    mutationFn: async (data) => {
      const me = await base44.auth.me();
      return base44.entities.ParentalLink.create({
        ...data,
        parent_email: me.email,
        share_location: true,
        share_battery: true,
        share_alerts: true,
        email_notifications: true,
        status: 'pendente',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parental-links'] });
      setOpenGroup(null);
      toast({ title: 'Convite enviado', description: 'A pessoa receberá um email para ativar o vínculo.' });
    }
  });

  const deleteLink = useMutation({
    mutationFn: (id) => base44.entities.ParentalLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parental-links'] });
      toast({ title: 'Vínculo removido' });
    }
  });

  // Agrupar por categoria (default = filho para registros antigos sem grupo)
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
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Família</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Sua Rede</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe quem você ama em tempo real, organizados por grupo
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-bold text-sm mb-1">Como funciona</p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Vincule cônjuge, filhos e parentes. Você receberá localização, bateria e alertas
              em tempo real, com total transparência.
            </p>
          </div>
        </div>
      </div>

      {/* Encontrar dispositivo */}
      <button
        onClick={() => navigate('/encontrar-dispositivo')}
        className="w-full mb-5 p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Search size={18} className="text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-sm">Encontrar dispositivo</p>
          <p className="text-blue-100 text-xs">Tocar alarme, localizar ou bloquear</p>
        </div>
        <ChevronRight size={18} className="text-white/80" />
      </button>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          <GroupSection
            icon={Heart}
            title="Cônjuge"
            subtitle="Parceiro(a) ou companheiro(a)"
            color="pink"
            members={groups.conjuge}
            onAdd={() => setOpenGroup('conjuge')}
            onDelete={(id) => deleteLink.mutate(id)}
          />
          <GroupSection
            icon={Baby}
            title="Filhos"
            subtitle="Crianças e adolescentes"
            color="blue"
            members={groups.filho}
            onAdd={() => setOpenGroup('filho')}
            onDelete={(id) => deleteLink.mutate(id)}
          />
          <GroupSection
            icon={Users}
            title="Parentes"
            subtitle="Avós, pais idosos, irmãos, tios"
            color="amber"
            members={groups.parente}
            onAdd={() => setOpenGroup('parente')}
            onDelete={(id) => deleteLink.mutate(id)}
          />
        </>
      )}

      <div className="mt-6 p-3 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-blue-700 text-xs font-semibold mb-1">🔐 Privacidade total</p>
        <p className="text-blue-600/70 text-xs">
          Cada pessoa pode ver o que está sendo compartilhado e revogar o vínculo a qualquer momento.
        </p>
      </div>

      <AddMemberDialog
        open={!!openGroup}
        group={openGroup}
        onClose={() => setOpenGroup(null)}
        onSubmit={(data) => createLink.mutate(data)}
        isPending={createLink.isPending}
      />
    </div>
  );
}