import { Equipment } from '@/data/mockData';
import { EquipmentCard } from './EquipmentCard';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface EquipmentSectionProps {
  equipment: Equipment[];
  onEquipmentClick: (id: string) => void;
  onAddEquipment: () => void;
}

export function EquipmentSection({ equipment, onEquipmentClick, onAddEquipment }: EquipmentSectionProps) {
  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-h4 font-semibold">My Equipment</h2>
          <p className="text-body-sm text-muted-foreground">{equipment.length} machines registered</p>
        </div>
        <Button variant="ace-outline" size="sm" onClick={onAddEquipment}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>
      
      <div className="space-y-2">
        {equipment.map((item) => (
          <EquipmentCard 
            key={item.id} 
            equipment={item} 
            onClick={onEquipmentClick}
          />
        ))}
      </div>
    </section>
  );
}
