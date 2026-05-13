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
      <div className="absolute inset-0" style={{ background: 'rgba(12,26,56,0.5)' }} />
      <div
        className="relative w-full max-w-sm rounded-t-3xl p-6 pb-8 slide-up"
        style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#FBEAEC' }}
            >
              <Shield size={20} style={{ color: '#A81825' }} />
            </div>
            <div>
              <h2 className="font-display text-xl" style={{ color: '#0C1A38' }}>Alerta SOS Ativo</h2>
              <p className="text-xs font-medium" style={{ color: '#A81825' }}>Emergência acionada</p>
            </div>
          </div>
          <button
            onClick={() => onClose(true)}
            aria-label="Cancelar alerta"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#EBF0F8' }}
          >
            <X size={16} style={{ color: '#607090' }} />
          </button>
        </div>

        {/* Status */}
        {!sent ? (
          <div
            className="mb-5 p-4 rounded-2xl text-center"
            style={{ background: '#FBEAEC', border: '1px solid #F1C5CA' }}
          >
            <div className="font-display text-5xl mb-1" style={{ color: '#A81825' }}>{countdown}</div>
            <p className="text-sm" style={{ color: '#607090' }}>segundos para enviar alertas</p>
            <button
              onClick={() => onClose(true)}
              className="mt-3 px-5 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ background: '#FFFFFF', color: '#0C1A38', border: '1px solid #C4D0E5' }}
            >
              Cancelar — Estou bem
            </button>
          </div>
        ) : (
          <div
            className="mb-5 p-4 rounded-2xl text-center"
            style={{ background: '#DDF0E6', border: '1px solid #B7DCC5' }}
          >
            <p className="font-bold text-base mb-1" style={{ color: '#155230' }}>✅ Alertas enviados!</p>
            <p className="text-sm" style={{ color: '#607090' }}>Seus contatos foram notificados com sua localização</p>
          </div>
        )}

        {/* Contacts notified */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#607090' }}>
            Contatos notificados
          </p>
          <div className="space-y-2">
            {contacts.slice(0, 3).map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: '#EBF0F8', border: '1px solid #C4D0E5' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: '#1743B8', color: '#FFFFFF' }}
                >
                  {contact.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#0C1A38' }}>{contact.name}</p>
                  <p className="text-xs font-mono" style={{ color: '#607090' }}>{contact.phone}</p>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: '#1743B8' }}>
                  <Phone size={12} />
                  {sent ? 'Notificado' : 'Aguardando'}
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <p className="text-sm text-center py-2" style={{ color: '#8A9FC0' }}>
                Nenhum contato cadastrado
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div
          className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: '#EBF0F8', border: '1px solid #C4D0E5' }}
        >
          <MapPin size={14} style={{ color: '#1743B8' }} className="flex-shrink-0" />
          <p className="text-xs" style={{ color: '#1743B8' }}>Localização em tempo real sendo compartilhada</p>
        </div>

        {sent && (
          <button
            onClick={() => onClose(false)}
            className="w-full mt-4 py-3 rounded-xl font-bold text-base hover:brightness-110 transition"
            style={{ background: '#1743B8', color: '#FFFFFF' }}
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}