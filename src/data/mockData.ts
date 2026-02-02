// ACE Central Mock Data

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  partNumber: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  deliveryTime: string;
  isPopular?: boolean;
  isFastTrack?: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  image: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastServiceDate: string;
  nextServiceDue: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  bgColor: string;
  validUntil: string;
}

export const categories: Category[] = [
  { id: 'engine', name: 'Engine Parts', icon: '⚙️', productCount: 245 },
  { id: 'hydraulic', name: 'Hydraulics', icon: '💧', productCount: 189 },
  { id: 'electrical', name: 'Electrical', icon: '⚡', productCount: 156 },
  { id: 'filters', name: 'Filters', icon: '🔧', productCount: 98 },
  { id: 'brakes', name: 'Brakes', icon: '🛑', productCount: 72 },
  { id: 'transmission', name: 'Transmission', icon: '🔄', productCount: 134 },
  { id: 'cabin', name: 'Cabin Parts', icon: '🪟', productCount: 67 },
  { id: 'undercarriage', name: 'Undercarriage', icon: '🔩', productCount: 89 },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Oil Filter Assembly',
    partNumber: 'ACE-OF-2024',
    categoryId: 'filters',
    price: 1250,
    originalPrice: 1499,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 45,
    deliveryTime: '2-4 hours',
    isPopular: true,
    isFastTrack: true,
  },
  {
    id: 'p2',
    name: 'Hydraulic Pump Motor',
    partNumber: 'ACE-HP-1089',
    categoryId: 'hydraulic',
    price: 18500,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 12,
    deliveryTime: '1-2 days',
    isPopular: true,
  },
  {
    id: 'p3',
    name: 'Alternator 24V 80A',
    partNumber: 'ACE-AL-2480',
    categoryId: 'electrical',
    price: 8750,
    originalPrice: 9999,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 8,
    deliveryTime: '4-6 hours',
    isFastTrack: true,
  },
  {
    id: 'p4',
    name: 'Engine Turbocharger',
    partNumber: 'ACE-TC-4500',
    categoryId: 'engine',
    price: 45000,
    image: '/placeholder.svg',
    inStock: false,
    stockQuantity: 0,
    deliveryTime: '5-7 days',
  },
  {
    id: 'p5',
    name: 'Brake Pad Set',
    partNumber: 'ACE-BP-1200',
    categoryId: 'brakes',
    price: 3200,
    originalPrice: 3800,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 34,
    deliveryTime: '2-4 hours',
    isPopular: true,
    isFastTrack: true,
  },
  {
    id: 'p6',
    name: 'Transmission Gear Kit',
    partNumber: 'ACE-TG-8800',
    categoryId: 'transmission',
    price: 28000,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 5,
    deliveryTime: '2-3 days',
  },
  {
    id: 'p7',
    name: 'Air Filter Element',
    partNumber: 'ACE-AF-3300',
    categoryId: 'filters',
    price: 850,
    originalPrice: 999,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 78,
    deliveryTime: '2-4 hours',
    isFastTrack: true,
  },
  {
    id: 'p8',
    name: 'Cabin Glass Panel',
    partNumber: 'ACE-CG-5500',
    categoryId: 'cabin',
    price: 12500,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 6,
    deliveryTime: '3-5 days',
  },
];

export const equipment: Equipment[] = [
  {
    id: 'e1',
    name: 'Hydraulic Excavator',
    model: 'ACE HX-300',
    serialNumber: 'HX300-2024-0045',
    image: '/placeholder.svg',
    status: 'active',
    lastServiceDate: '2024-12-15',
    nextServiceDue: '2025-03-15',
  },
  {
    id: 'e2',
    name: 'Tower Crane',
    model: 'ACE TC-150',
    serialNumber: 'TC150-2023-0128',
    image: '/placeholder.svg',
    status: 'maintenance',
    lastServiceDate: '2025-01-20',
    nextServiceDue: '2025-02-20',
  },
  {
    id: 'e3',
    name: 'Wheel Loader',
    model: 'ACE WL-500',
    serialNumber: 'WL500-2024-0089',
    image: '/placeholder.svg',
    status: 'active',
    lastServiceDate: '2025-01-05',
    nextServiceDue: '2025-04-05',
  },
];

export const offers: Offer[] = [
  {
    id: 'o1',
    title: 'Fast Track Delivery',
    subtitle: 'Get parts in 2-4 hours',
    discount: '₹500 OFF',
    bgColor: 'bg-gradient-ace',
    validUntil: '2025-02-28',
  },
  {
    id: 'o2',
    title: 'Bulk Order Discount',
    subtitle: 'Order 10+ items',
    discount: '15% OFF',
    bgColor: 'bg-gradient-secondary',
    validUntil: '2025-03-15',
  },
  {
    id: 'o3',
    title: 'Filter Fest',
    subtitle: 'All filters on sale',
    discount: '20% OFF',
    bgColor: 'bg-gradient-hero',
    validUntil: '2025-02-20',
  },
];

export const cartItems = [
  { productId: 'p1', quantity: 2 },
  { productId: 'p5', quantity: 1 },
];
