import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Camera, Loader2, Heart, AlertTriangle, Pill,
  Phone, User, Save, Smartphone, FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const BLOOD_TYPES = ['desconhecido', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function CriancaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: link, isLoading } = useQuery({
    queryKey: ['parental-link', id],
    queryFn: async () => {
      const all = await base44.entities.ParentalLink.filter({ id });
      return all[0] || null;
    },
  });

  useEffect(() => {
    if (link && !form) setForm(link);
  }, [link, form]);

  const updateMut = useMutation({
    mutationFn: (data) => base44.entities.ParentalLink.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parental-link', id] });
      queryClient.invalidateQueries({ queryKey: ['parental-links'] });
      toast({ title: 'Informações salvas' });
    },
    onError: (err) => toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, child_photo_url: file_url });
      await base44.entities.ParentalLink.update(id, { child_photo_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['parental-link', id] });
      toast({ title: 'Foto atualizada' });
    } catch (err) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    const { id: _id, created_date, updated_date, created_by, ...rest } = form;
    updateMut.mutate(rest);
  };

  const handleDownloadPdf = async () => {
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
    } catch (err) {
      toast({ title: 'Erro ao gerar PDF', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen p-6 text-center max-w-md mx-auto">
        <p className="text-foreground font-semibold mt-10">Vínculo não encontrado.</p>
        <button onClick={() => navigate('/familia')} className="mt-4 text-blue-600 font-semibold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-8 max-w-md mx-auto">
      <button
        onClick={() => navigate('/familia')}
        className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-4 hover:text-foreground"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Avatar + nome */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          <div
            className="w-28 h-28 rounded-2xl flex items-center justify-center font-display text-5xl overflow-hidden"
            style={{ background: '#1743B8', color: '#FFFFFF' }}
          >
            {form.child_photo_url
              ? <img src={form.child_photo_url} alt={form.child_name} className="w-full h-full object-cover" />
              : form.child_name?.[0]?.toUpperCase() || '?'}
          </div>
          <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border-2 border-gray-200 shadow flex items-center justify-center cursor-pointer hover:bg-gray-50">
            {uploading ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <Camera size={14} className="text-blue-600" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        <h1 className="text-foreground text-2xl font-black">{form.child_name}</h1>
        <p className="text-muted-foreground text-sm">{form.child_email}</p>
        {form.child_age && (
          <span className="mt-1 text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
            {form.child_age} anos
          </span>
        )}
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={() => navigate('/encontrar-dispositivo')}
          className="p-3 rounded-2xl bg-white border border-gray-200 flex flex-col items-center gap-1 hover:bg-gray-50 active:scale-[0.98]"
        >
          <Smartphone size={18} className="text-blue-600" />
          <span className="text-xs font-bold text-foreground">Encontrar</span>
        </button>
        <button
          onClick={handleDownloadPdf}
          className="p-3 rounded-2xl bg-white border border-gray-200 flex flex-col items-center gap-1 hover:bg-gray-50 active:scale-[0.98]"
        >
          <FileText size={18} className="text-blue-600" />
          <span className="text-xs font-bold text-foreground">Relatório PDF</span>
        </button>
      </div>

      {/* Saúde */}
      <Section icon={Heart} iconColor="text-red-600" iconBg="bg-red-50" title="Informações de saúde" subtitle="Críticas em situações de resgate">
        <div className="space-y-3">
          <Field label="Tipo sanguíneo">
            <Select value={form.blood_type || 'desconhecido'} onValueChange={v => setForm({ ...form, blood_type: v })}>
              <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map(b => <SelectItem key={b} value={b}>{b === 'desconhecido' ? 'Não sei' : b}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Alergias" icon={AlertTriangle}>
            <Textarea
              placeholder="Ex: amendoim, dipirona, látex…"
              value={form.allergies || ''}
              onChange={e => setForm({ ...form, allergies: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl resize-none"
              rows={2}
            />
          </Field>
          <Field label="Medicações em uso" icon={Pill}>
            <Textarea
              placeholder="Ex: insulina, ritalina…"
              value={form.medications || ''}
              onChange={e => setForm({ ...form, medications: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl resize-none"
              rows={2}
            />
          </Field>
          <Field label="Condições médicas">
            <Textarea
              placeholder="Ex: diabetes, asma, epilepsia…"
              value={form.medical_conditions || ''}
              onChange={e => setForm({ ...form, medical_conditions: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl resize-none"
              rows={2}
            />
          </Field>
          <Field label="Observações para resgate">
            <Textarea
              placeholder="Informações que socorristas precisam saber"
              value={form.emergency_notes || ''}
              onChange={e => setForm({ ...form, emergency_notes: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl resize-none"
              rows={2}
            />
          </Field>
        </div>
      </Section>

      {/* Contato secundário */}
      <Section icon={Phone} iconColor="text-emerald-600" iconBg="bg-emerald-50" title="Contato secundário" subtitle="Acionado se você não responder">
        <div className="space-y-3">
          <Field label="Nome" icon={User}>
            <Input
              placeholder="Ex: Vovó Maria"
              value={form.secondary_contact_name || ''}
              onChange={e => setForm({ ...form, secondary_contact_name: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl"
            />
          </Field>
          <Field label="Telefone">
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              value={form.secondary_contact_phone || ''}
              onChange={e => setForm({ ...form, secondary_contact_phone: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl"
            />
          </Field>
          <Field label="Relação">
            <Input
              placeholder="Avó, tio, vizinho…"
              value={form.secondary_contact_relation || ''}
              onChange={e => setForm({ ...form, secondary_contact_relation: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl"
            />
          </Field>
        </div>
      </Section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={updateMut.isPending}
        className="w-full py-4 rounded-xl font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: '#1743B8', color: '#FFFFFF' }}
      >
        {updateMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Salvar informações
      </button>

      <div className="mt-5 p-3 rounded-2xl bg-amber-50 border border-amber-100">
        <p className="text-amber-700 text-xs font-semibold mb-1">⚕️ Privacidade médica</p>
        <p className="text-amber-600/80 text-xs">
          Estes dados ficam disponíveis apenas para você (responsável vinculado) e podem ser exibidos
          em emergências para equipes de resgate autorizadas.
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, iconColor, iconBg, title, subtitle, children }) {
  return (
    <div className="glass-card rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={16} className={iconColor} />
        </div>
        <div>
          <h2 className="text-foreground font-bold text-base">{title}</h2>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon size={12} />}
        {label}
      </Label>
      {children}
    </div>
  );
}