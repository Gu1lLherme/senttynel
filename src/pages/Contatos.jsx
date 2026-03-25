import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Phone, User, Star, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const relationshipLabels = {
  familiar: 'Familiar',
  amigo: 'Amigo(a)',
  colega: 'Colega',
  parceiro: 'Parceiro(a)',
  outro: 'Outro'
};

const avatarColors = ['#FF2D55', '#BF5FFF', '#00F5FF', '#00FF87', '#FF9500', '#5856D6'];

export default function Contatos() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relationship: 'familiar' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-priority', 20),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create({
      ...data,
      priority: contacts.length + 1,
      is_active: true,
      avatar_color: avatarColors[contacts.length % avatarColors.length]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setOpen(false);
      setForm({ name: '', phone: '', relationship: 'familiar' });
      toast({ title: 'Contato adicionado com sucesso' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Contato removido' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    createMutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Shield size={16} className="text-purple-400" />
          </div>
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Rede de Proteção</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Contatos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pessoas que serão alertadas em emergências
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-5 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
        <Star size={16} className="text-purple-400 flex-shrink-0" />
        <p className="text-purple-300 text-xs">
          Até 5 contatos são notificados em ordem de prioridade durante um alerta SOS.
        </p>
      </div>

      {/* Add button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full mb-5 p-4 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
      >
        <Plus size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-muted-foreground group-hover:text-primary text-sm font-semibold transition-colors">
          Adicionar contato de confiança
        </span>
      </button>

      {/* Contact list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-foreground font-semibold">Nenhum contato ainda</p>
          <p className="text-muted-foreground text-sm mt-1">
            Adicione alguém de confiança para te proteger
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div
              key={contact.id}
              className="glass-card rounded-2xl p-4 flex items-center gap-4 slide-up"
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                style={{ backgroundColor: contact.avatar_color || avatarColors[index % avatarColors.length] }}
              >
                {contact.name[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-bold text-base truncate">{contact.name}</p>
                  {index === 0 && (
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                      1º
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Phone size={11} />
                    {contact.phone}
                  </div>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-muted-foreground text-xs">
                    {relationshipLabels[contact.relationship] || contact.relationship}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    aria-label={`Remover ${contact.name}`}
                    className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={15} className="text-red-400" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border max-w-sm mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover contato?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {contact.name} não receberá mais alertas de emergência.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(contact.id)}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">Novo Contato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-muted-foreground text-sm">Nome completo</Label>
              <Input
                id="name"
                placeholder="Ex: Maria Silva"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-secondary/50 border-border rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-muted-foreground text-sm">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                placeholder="+55 11 99999-9999"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="bg-secondary/50 border-border rounded-xl"
                type="tel"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Relacionamento</Label>
              <Select value={form.relationship} onValueChange={v => setForm({ ...form, relationship: v })}>
                <SelectTrigger className="bg-secondary/50 border-border rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(relationshipLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? 'Salvando…' : 'Adicionar Contato'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}