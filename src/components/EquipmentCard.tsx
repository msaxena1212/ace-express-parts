import { Equipment } from '@/data/mockData';
import { Wrench, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: (id: string) => void;
}

export function EquipmentCard({ equipment, onClick }: EquipmentCardProps) {
  const statusConfig = {
    active: { label: 'Active', color: 'bg-success-subtle text-success', icon: CheckCircle },
    maintenance: { label: 'In Maintenance', color: 'bg-warning-subtle text-warning', icon: Wrench },
    inactive: { label: 'Inactive', color: 'bg-muted text-muted-foreground', icon: AlertTriangle },
  };

  const status = statusConfig[equipment.status];
  const StatusIcon = status.icon;

  return (
    <button
      onClick={() => onClick(equipment.id)}
      className="flex items-center gap-3 bg-card border border-border p-3 rounded-xl hover:border-primary/50 transition-all w-full text-left active:scale-[0.99]"
    >
      <div className="w-14 h-14 bg-muted rounded-xl flex-shrink-0 overflow-hidden border border-border">
        <img 
          src={equipment.image} 
          alt={equipment.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-foreground">{equipment.name}</p>
        <p className="text-xs text-muted-foreground">{equipment.model}</p>
        <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
