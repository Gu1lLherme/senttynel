import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function GroupSection({ icon: Icon, title, subtitle, color, members, onAdd, onDelete, hideActions = false }) {
  const navigate = useNavigate();
  const colorClasses = {
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', grad: 'from-pink-400 to-pink-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', grad: 'from-blue-400 to-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', grad: 'from-amber-400 to-amber-600' },
  };
  const c = colorClasses[color] || colorClasses.blue;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
            <Icon size={15} className={c.text} />
          </div>
          <div>
            <h2 className="text-foreground font-bold text-sm">{title}</h2>
            <p className="text-muted-foreground text-[11px]">{subtitle}</p>
          </div>
        </div>
        {!hideActions && (
          <button
            onClick={onAdd}
            className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center hover:opacity-80 transition`}
            aria-label={`Adicionar ${title}`}
          >
            <Plus size={15} className={c.text} />
          </button>
        )}
      </div>

      {members.length === 0 ? (
        hideActions ? (
          <p className="text-center text-xs text-muted-foreground py-3 italic">Ninguém cadastrado neste grupo</p>
        ) : (
          <button
            onClick={onAdd}
            className={`w-full p-3 rounded-2xl border-2 border-dashed ${c.border} flex items-center justify-center gap-2 hover:${c.bg} transition`}
          >
            <Plus size={14} className={c.text} />
            <span className={`text-xs font-semibold ${c.text}`}>Adicionar {title.toLowerCase()}</span>
          </button>
        )
      ) : (
        <div className="space-y-2">
          {members.map(link => (
            <div key={link.id} className="glass-card rounded-2xl p-3 flex items-center gap-3">
              <button
                onClick={() => navigate(`/familia/${link.id}`)}
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-white font-black overflow-hidden flex-shrink-0`}
              >
                {link.child_photo_url
                  ? <img src={link.child_photo_url} alt={link.child_name} className="w-full h-full object-cover" />
                  : link.child_name?.[0]?.toUpperCase() || '?'}
              </button>
              <button
                onClick={() => navigate(`/familia/${link.id}`)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-foreground font-bold text-sm truncate">{link.child_name}</p>
                <p className="text-muted-foreground text-xs truncate">
                  {link.relationship_label || link.child_email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    link.status === 'ativo' ? 'bg-emerald-500 animate-pulse' :
                    link.status === 'pendente' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  <span className={`text-[10px] font-semibold ${
                    link.status === 'ativo' ? 'text-emerald-600' :
                    link.status === 'pendente' ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {link.status === 'ativo' ? 'Ativo' : link.status === 'pendente' ? 'Aguardando' : 'Pausado'}
                  </span>
                </div>
              </button>
              <ChevronRight size={14} className="text-gray-400" />
              {!hideActions && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition">
                      <Trash2 size={13} className="text-red-500" />
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