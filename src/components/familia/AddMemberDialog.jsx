import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Baby, Users } from 'lucide-react';

const groupConfig = {
  conjuge: {
    label: 'Cônjuge / Parceiro(a)',
    icon: Heart,
    relations: ['Esposa', 'Marido', 'Parceiro(a)', 'Namorado(a)'],
    showAge: false,
  },
  filho: {
    label: 'Filho(a)',
    icon: Baby,
    relations: ['Filha', 'Filho', 'Enteado(a)'],
    showAge: true,
  },
  parente: {
    label: 'Parente',
    icon: Users,
    relations: ['Mãe', 'Pai', 'Avó', 'Avô', 'Irmã', 'Irmão', 'Tia', 'Tio', 'Sogra', 'Sogro'],
    showAge: true,
  },
};

export default function AddMemberDialog({ open, onClose, group, onSubmit, isPending }) {
  const [form, setForm] = useState({
    child_name: '', child_email: '', child_age: '', relationship_label: '',
  });

  useEffect(() => {
    if (open) {
      setForm({ child_name: '', child_email: '', child_age: '', relationship_label: '' });
    }
  }, [open, group]);

  if (!group) return null;
  const cfg = groupConfig[group];
  const Icon = cfg.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.child_name || !form.child_email) return;
    onSubmit({
      ...form,
      group,
      child_age: form.child_age ? parseInt(form.child_age) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-sm mx-auto rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon size={16} className="text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-black">Vincular {cfg.label}</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">Nome</Label>
            <Input
              placeholder="Ex: Maria"
              value={form.child_name}
              onChange={e => setForm({ ...form, child_name: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">Email</Label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={form.child_email}
              onChange={e => setForm({ ...form, child_email: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl"
              required
            />
            <p className="text-xs text-muted-foreground">A pessoa receberá um convite por email</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">Relação</Label>
            <div className="flex flex-wrap gap-1.5">
              {cfg.relations.map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, relationship_label: r })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    form.relationship_label === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {cfg.showAge && (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Idade (opcional)</Label>
              <Input
                type="number"
                min="0"
                max="120"
                placeholder="Ex: 10"
                value={form.child_age}
                onChange={e => setForm({ ...form, child_age: e.target.value })}
                className="bg-gray-50 border-gray-200 rounded-xl"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isPending ? 'Enviando convite…' : 'Enviar convite'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}