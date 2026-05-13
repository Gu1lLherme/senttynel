import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Home, Briefcase, GraduationCap, MapPin, AlertTriangle, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const ICON_MAP = {
  home: Home,
  work: Briefcase,
  school: GraduationCap,
  gym: MapPin,
  danger: AlertTriangle,
  other: MapPin,
};

export default function ZoneList({ zones = [], emptyText, accent = 'blue' }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteZone = useMutation({
    mutationFn: (id) => base44.entities.SafeZone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safezones'] });
      toast({ title: 'Zona removida' });
    }
  });

  const toggleZone = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.SafeZone.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['safezones'] }),
  });

  if (zones.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground text-sm">{emptyText || 'Nenhuma zona configurada'}</p>
      </div>
    );
  }

  const isDanger = accent === 'red';
  const iconBg = isDanger ? 'bg-red-50' : 'bg-blue-50';
  const iconColor = isDanger ? 'text-red-600' : 'text-blue-600';

  return (
    <div className="space-y-2">
      {zones.map(zone => {
        const Icon = ICON_MAP[zone.icon] || MapPin;
        return (
          <div key={zone.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon size={16} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-semibold text-sm truncate">{zone.name}</p>
              <p className="text-muted-foreground text-xs truncate">{zone.address}</p>
              {zone.lat && (
                <p className="text-emerald-600 text-[10px] font-semibold">
                  ✓ Localizado · raio {zone.radius_meters}m
                </p>
              )}
            </div>
            <Switch
              checked={zone.is_active}
              onCheckedChange={(v) => toggleZone.mutate({ id: zone.id, is_active: v })}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  aria-label={`Remover ${zone.name}`}
                  className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border-gray-200 max-w-sm mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover zona?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A zona "{zone.name}" será removida.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteZone.mutate(zone.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}
    </div>
  );
}