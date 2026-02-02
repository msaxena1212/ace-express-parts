import { Wrench, ClipboardList, Truck, Package, Headphones, FileText } from 'lucide-react';

const actions = [
  { icon: Wrench, label: 'Service\nRequest', color: 'bg-orange-subtle text-primary' },
  { icon: ClipboardList, label: 'My\nOrders', color: 'bg-orange-subtle text-primary' },
  { icon: Truck, label: 'Track\nDelivery', color: 'bg-orange-subtle text-primary' },
  { icon: Package, label: 'Bulk\nOrder', color: 'bg-orange-subtle text-primary' },
  { icon: Headphones, label: 'Support', color: 'bg-orange-subtle text-primary' },
  { icon: FileText, label: 'Invoices', color: 'bg-orange-subtle text-primary' },
];

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <section className="px-4 py-4">
      <h2 className="text-base font-semibold mb-3 text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action.label)}
            className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all active:scale-[0.98]"
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-xs text-center whitespace-pre-line leading-tight font-medium text-foreground">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
