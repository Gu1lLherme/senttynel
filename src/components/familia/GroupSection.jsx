import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function GroupSection({ icon: Icon, title, subtitle, color, members, onAdd, onDelete, hideActions = false }) {
  const navigate = useNavigate();
  // Paleta SENTINEL — sólido, sem gradiente; cores apenas indicam grupo
  const colorMap = {
    pink:  { iconBg: '#FBEAEC', iconColor: '#A81825', avatar: '#A81825', dashed: '#F1C5CA' },
    blue:  { iconBg: '#EBF0F8', iconColor: '#1743B8', avatar: '#1743B8', dashed: '#C4D0E5' },
    amber: { iconBg: '#FFF4E0', iconColor: '#8A5B00', avatar: '#8A5B00', dashed: '#EBD9B2' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: c.iconBg }}
          >
            <Icon size={15} style={{ color: c.iconColor }} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm truncate" style={{ color: '#0C1A38' }}>{title}</h2>
            <p className="text-[11px] truncate" style={{ color: '#607090' }}>{subtitle}</p>
          </div>
        </div>
        {!hideActions && (
          <button
            onClick={onAdd}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-80 transition"
            style={{ background: c.iconBg }}
            aria-label={`Adicionar ${title}`}
          >
            <Plus size={15} style={{ color: c.iconColor }} />
          </button>
        )}
      </div>

      {members.length === 0 ? (
        hideActions ? (
          <p className="text-center text-xs py-3 italic" style={{ color: '#8A9FC0' }}>Ninguém cadastrado neste grupo</p>
        ) : (
          <button
            onClick={onAdd}
            className="w-full p-3 rounded-2xl flex items-center justify-center gap-2 transition"
            style={{ border: `2px dashed ${c.dashed}`, color: c.iconColor }}
          >
            <Plus size={14} />
            <span className="text-xs font-semibold">Adicionar {title.toLowerCase()}</span>
          </button>
        )
      ) : (
        <div className="space-y-2">
          {members.map(link => (
            <div
              key={link.id}
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
            >
              <button
                onClick={() => navigate(`/familia/${link.id}`)}
                className="w-11 h-11 rounded-xl flex items-center justify-center font-black overflow-hidden flex-shrink-0"
                style={{ background: c.avatar, color: '#FFFFFF' }}
              >
                {link.child_photo_url
                  ? <img src={link.child_photo_url} alt={link.child_name} className="w-full h-full object-cover" />
                  : link.child_name?.[0]?.toUpperCase() || '?'}
              </button>
              <button
                onClick={() => navigate(`/familia/${link.id}`)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="font-bold text-sm truncate" style={{ color: '#0C1A38' }}>{link.child_name}</p>
                <p className="text-xs truncate" style={{ color: '#607090' }}>
                  {link.relationship_label || link.child_email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {(() => {
                    const map = {
                      ativo:    { dot: '#155230', color: '#155230', label: 'Ativo',     pulse: true },
                      pendente: { dot: '#8A5B00', color: '#8A5B00', label: 'Aguardando', pulse: false },
                    };
                    const s = map[link.status] || { dot: '#8A9FC0', color: '#8A9FC0', label: 'Pausado', pulse: false };
                    return (
                      <>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${s.pulse ? 'animate-pulse' : ''}`}
                          style={{ background: s.dot }}
                        />
                        <span className="text-[10px] font-semibold" style={{ color: s.color }}>
                          {s.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </button>
              <ChevronRight size={14} style={{ color: '#8A9FC0' }} />
              {!hideActions && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                      style={{ background: '#FBEAEC' }}
                    >
                      <Trash2 size={13} style={{ color: '#A81825' }} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white max-w-sm mx-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover vínculo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você não receberá mais informações de {link.child_name}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(link.id)}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}