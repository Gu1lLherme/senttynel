import { useState, useEffect } from 'react';
import { X, Phone, MapPin, Shield } from 'lucide-react';

export default function SOSModal({ contacts, onClose }) {
  const [countdown, setCountdown] = useState(10);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (sent) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSent(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sent]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white border border-red-200 rounded-t-3xl p-6 pb-8 slide-up shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Shield size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-foreground font-black text-lg">Alerta SOS Ativo</h2>
              <p className="text-red-600 text-xs font-medium">Emergência acionada</p>
            </div>
          </div>
          <button
            onClick={() => onClose(true)}
            aria-label="Cancelar alerta"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Status */}
        {!sent ? (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
            <div className="text-5xl font-black text-red-600 mb-1">{countdown}</div>
            <p className="text-muted-foreground text-sm">segundos para enviar alertas</p>
            <button
              onClick={() => onClose(true)}
              className="mt-3 px-5 py-2 rounded-full bg-gray-100 text-foreground text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancelar — Estou bem
            </button>
          </div>
        ) : (
          <div className="mb-5 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
            <p className="text-blue-700 font-bold text-base mb-1">✅ Alertas enviados!</p>
            <p className="text-muted-foreground text-sm">Seus contatos foram notificados com sua localização</p>
          </div>
        )}

        {/* Contacts notified */}
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            Contatos notificados
          </p>
          <div className="space-y-2">
            {contacts.slice(0, 3).map(contact => (
              <div key={contact.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                  {contact.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm truncate">{contact.name}</p>
                  <p className="text-muted-foreground text-xs">{contact.phone}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Phone size={12} />
                  {sent ? 'Notificado' : 'Aguardando'}
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-2">
                Nenhum contato cadastrado
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
          <MapPin size={14} className="text-blue-600 flex-shrink-0" />
          <p className="text-blue-700 text-xs">Localização em tempo real sendo compartilhada</p>
        </div>

        {sent && (
          <button
            onClick={() => onClose(false)}
            className="w-full mt-4 py-3 rounded-2xl bg-primary text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}