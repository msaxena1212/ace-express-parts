import { Equipment } from '@/data/mockData';
import { Wrench, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: (id: string) => void;
}

export function EquipmentCard({ equipment, onClick }: EquipmentCardProps) {
  const statusConfig = {
    active: { label: 'Active', color: 'bg-success/10 text-success', icon: CheckCircle },
    maintenance: { label: 'In Maintenance', color: 'bg-warning/10 text-warning', icon: Wrench },
    inactive: { label: 'Inactive', color: 'bg-muted text-muted-foreground', icon: AlertTriangle },
  };

  const status = statusConfig[equipment.status];
  const StatusIcon = status.icon;

  return (
    <button
      onClick={() => onClick(equipment.id)}
      className="flex items-center gap-3 bg-card p-3 rounded-lg shadow-ace-sm hover:shadow-ace-md transition-all w-full text-left active:scale-[0.98]"
    >
      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
        <img 
          src={equipment.image} 
          alt={equipment.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium truncate">{equipment.name}</p>
        <p className="text-body-sm text-muted-foreground">{equipment.model}</p>
        <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-pill text-body-sm font-medium ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
