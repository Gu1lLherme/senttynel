import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, CheckCircle2 } from 'lucide-react';
import { isPushSupported, getPermissionState, subscribeToPush, unsubscribeFromPush } from '@/lib/pushNotifications';
import { useToast } from '@/components/ui/use-toast';

export default function PushPermissionCard() {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isPushSupported()) { setSupported(false); return; }
    getPermissionState().then(setPermission);
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
      setPermission('granted');
      toast({ title: 'Notificações ativadas', description: 'Você receberá alertas instantâneos.' });
    } catch (e) {
      toast({ title: 'Não foi possível ativar', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await unsubscribeFromPush();
      setPermission('default');
      toast({ title: 'Notificações desativadas' });
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
        <p className="text-amber-700 text-xs font-semibold">⚠️ Push não suportado neste navegador</p>
        <p className="text-amber-600/80 text-xs mt-1">Use Chrome, Edge, Firefox ou o app móvel para receber alertas instantâneos.</p>
      </div>
    );
  }

  const granted = permission === 'granted';

  return (
    <div className={`p-4 rounded-2xl border ${granted ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${granted ? 'bg-emerald-100' : 'bg-blue-100'}`}>
          {granted ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Bell size={18} className="text-blue-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-bold text-sm">
            {granted ? 'Notificações ativas' : 'Receber alertas instantâneos'}
          </p>
          <p className="text-muted-foreground text-xs">
            {granted ? 'Alertas chegam na tela de bloqueio' : 'Emergências e cercas direto no celular'}
          </p>
        </div>
        <button
          onClick={granted ? handleDisable : handleEnable}
          disabled={loading || permission === 'denied'}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            granted
              ? 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {loading && <Loader2 size={12} className="animate-spin" />}
          {granted ? <><BellOff size={12} /> Desativar</> : <><Bell size={12} /> Ativar</>}
        </button>
      </div>
      {permission === 'denied' && (
        <p className="text-xs text-red-600 mt-2">
          Você bloqueou as notificações. Permita nas configurações do navegador para reativar.
        </p>
      )}
    </div>
  );
}