import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Baby, Users, ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import GroupSection from '@/components/familia/GroupSection';
import AddMemberDialog from '@/components/familia/AddMemberDialog';

export default function CadastrarFamilia() {
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
      toast({ title: 'Convite enviado', description: 'A pessoa receberá um email para ativar.' });
    }
  });

  const deleteLink = useMutation({
    mutationFn: (id) => base44.entities.ParentalLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parental-links'] });
      toast({ title: 'Vínculo removido' });
    }
  });

  const groups = {
    conjuge: links.filter(l => l.group === 'conjuge'),
    filho: links.filter(l => !l.group || l.group === 'filho'),
    parente: links.filter(l => l.group === 'parente'),
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-24 max-w-md mx-auto">
      <button
        onClick={() => navigate('/familia')}
        className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-4 hover:text-foreground"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <UserPlus size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Família · Cadastro</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Cadastrar família</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adicione, edite ou remova pessoas da sua rede de proteção
        </p>
      </div>

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