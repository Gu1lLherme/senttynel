import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Baby, MapPin, Battery, BellRing, Shield, Mail, Smartphone, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function ControleParental() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ child_name: '', child_email: '', child_age: 10 });
  const [downloadingId, setDownloadingId] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDownloadPdf = async (link) => {
    setDownloadingId(link.id);
    try {
      const now = new Date();
      const res = await base44.functions.invoke('generateMonthlyReport', {
        child_email: link.child_email,
        year: now.getFullYear(),
        month: now.getMonth(),
      }, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentinel-${link.child_name}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Relatório baixado', description: `Resumo mensal de ${link.child_name}` });
    } catch (err) {
      toast({ title: 'Erro ao gerar PDF', description: err.message, variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  };

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
      setOpen(false);
      setForm({ child_name: '', child_email: '', child_age: 10 });
      toast({ title: 'Convite enviado', description: 'A criança receberá um email para ativar o vínculo.' });
    }
  });

  const updateLink = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ParentalLink.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parental-links'] }),
  });

  const deleteLink = useMutation({
    mutationFn: (id) => base44.entities.ParentalLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parental-links'] });
      toast({ title: 'Vínculo removido' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.child_name || !form.child_email) return;
    createLink.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Baby size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Família</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Controle Parental</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe seus filhos em tempo real com total privacidade
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-bold text-sm mb-1">Como funciona</p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Vincule a conta do seu filho e receba localização, bateria e alertas
              tanto pelo app quanto por email automaticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Add */}
      <button
        onClick={() => setOpen(true)}
        className="w-full mb-5 p-4 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
      >
        <Plus size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
        <span className="text-gray-400 group-hover:text-blue-600 text-sm font-semibold transition-colors">
          Vincular criança
        </span>
      </button>

      {/* Children list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <p className="text-foreground font-semibold">Nenhuma criança vinculada</p>
          <p className="text-muted-foreground text-sm mt-1">
            Adicione um filho para começar a monitorar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map(link => (
            <div key={link.id} className="glass-card rounded-2xl p-4 slide-up">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {link.child_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-bold text-base truncate">{link.child_name}</p>
                    {link.child_age && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                        {link.child_age} anos
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs truncate">{link.child_email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      link.status === 'ativo' ? 'bg-blue-500 animate-pulse' :
                      link.status === 'pendente' ? 'bg-amber-500' : 'bg-gray-400'
                    }`} />
                    <span className={`text-xs font-semibold ${
                      link.status === 'ativo' ? 'text-blue-600' :
                      link.status === 'pendente' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {link.status === 'ativo' ? 'Ativo' : link.status === 'pendente' ? 'Aguardando confirmação' : 'Pausado'}
                    </span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      aria-label={`Remover ${link.child_name}`}
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border-gray-200 max-w-sm mx-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover vínculo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você não receberá mais informações de {link.child_name}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteLink.mutate(link.id)}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Live data preview */}
              {link.status === 'ativo' && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Battery size={11} className="text-blue-600" />
                      <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Bateria</span>
                    </div>
                    <p className="text-foreground font-bold text-sm">87%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MapPin size={11} className="text-blue-600" />
                      <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Última localização</span>
                    </div>
                    <p className="text-foreground font-bold text-sm">Há 2 min</p>
                  </div>
                </div>
              )}

              {/* PDF Report Button */}
              <button
                onClick={() => handleDownloadPdf(link)}
                disabled={downloadingId === link.id}
                className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {downloadingId === link.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileText size={14} />
                )}
                {downloadingId === link.id ? 'Gerando relatório…' : 'Baixar relatório mensal (PDF)'}
              </button>

              {/* Permissions */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <PermissionToggle
                  icon={<MapPin size={13} />}
                  label="Localização em tempo real"
                  checked={link.share_location}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { share_location: v } })}
                />
                <PermissionToggle
                  icon={<Battery size={13} />}
                  label="Nível de bateria"
                  checked={link.share_battery}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { share_battery: v } })}
                />
                <PermissionToggle
                  icon={<BellRing size={13} />}
                  label="Alertas (queda, pânico)"
                  checked={link.share_alerts}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { share_alerts: v } })}
                />
                <PermissionToggle
                  icon={<Mail size={13} />}
                  label="Notificações por email"
                  checked={link.email_notifications}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { email_notifications: v } })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy note */}
      <div className="mt-5 p-3 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-blue-700 text-xs font-semibold mb-1">🔐 Privacidade Total</p>
        <p className="text-blue-600/70 text-xs">
          A criança pode ver tudo que está sendo compartilhado. Transparência sempre.
        </p>
      </div>

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">Vincular Criança</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="child-name" className="text-muted-foreground text-sm">Nome da criança</Label>
              <Input
                id="child-name"
                placeholder="Ex: João"
                value={form.child_name}
                onChange={e => setForm({ ...form, child_name: e.target.value })}
                className="bg-gray-50 border-gray-200 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="child-email" className="text-muted-foreground text-sm">Email da criança</Label>
              <Input
                id="child-email"
                type="email"
                placeholder="filho@email.com"
                value={form.child_email}
                onChange={e => setForm({ ...form, child_email: e.target.value })}
                className="bg-gray-50 border-gray-200 rounded-xl"
                required
              />
              <p className="text-xs text-muted-foreground">A criança receberá um convite por email</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="child-age" className="text-muted-foreground text-sm">Idade</Label>
              <Input
                id="child-age"
                type="number"
                min="3"
                max="17"
                value={form.child_age}
                onChange={e => setForm({ ...form, child_age: parseInt(e.target.value) || 0 })}
                className="bg-gray-50 border-gray-200 rounded-xl"
              />
            </div>
            <button
              type="submit"
              disabled={createLink.isPending}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createLink.isPending ? 'Enviando convite…' : 'Enviar convite'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PermissionToggle({ icon, label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
        {icon}
      </div>
      <span className="flex-1 text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}