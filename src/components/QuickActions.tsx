import { Wrench, ClipboardList, Truck, Package, Headphones, FileText } from 'lucide-react';

const actions = [
  { icon: Wrench, label: 'Service\nRequest', color: 'bg-primary/10 text-primary' },
  { icon: ClipboardList, label: 'My\nOrders', color: 'bg-secondary/10 text-secondary' },
  { icon: Truck, label: 'Track\nDelivery', color: 'bg-success/10 text-success' },
  { icon: Package, label: 'Bulk\nOrder', color: 'bg-accent/10 text-accent' },
  { icon: Headphones, label: 'Support', color: 'bg-info/10 text-info' },
  { icon: FileText, label: 'Invoices', color: 'bg-warning/10 text-warning' },
];

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <section className="px-4 py-4">
      <h2 className="text-h4 font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action.label)}
            className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg shadow-ace-sm hover:shadow-ace-md transition-all active:scale-[0.98]"
          >
            <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-body-sm text-center whitespace-pre-line leading-tight font-medium">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
