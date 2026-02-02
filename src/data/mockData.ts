// ACE Central Mock Data - Based on actual ACE equipment categories

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string;
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

// Equipment types based on ACE website
export const equipmentTypes = [
  { id: 'fork-lift', name: 'Fork Lift', icon: '🏗️' },
  { id: 'grader', name: 'Grader', icon: '🚜' },
  { id: 'harvester', name: 'Harvester', icon: '🌾' },
  { id: 'next-gen-cranes', name: 'Next Gen Cranes', icon: '🏗️' },
  { id: 'pick-carry-cranes', name: 'Pick & Carry Cranes', icon: '🔧' },
  { id: 'rough-terrain-cranes', name: 'Rough Terrain Cranes', icon: '⛰️' },
  { id: 'tower-cranes', name: 'Tower Cranes', icon: '🗼' },
  { id: 'tractor', name: 'Tractor', icon: '🚜' },
  { id: 'vibratory-roller', name: 'Vibratory Roller', icon: '🛞' },
  { id: 'back-hoe', name: 'Back Hoe', icon: '⚙️' },
  { id: 'crawler-cranes', name: 'Crawler Cranes', icon: '🦀' },
];

// Part categories based on ACE website
export const categories: Category[] = [
  { id: 'boom-lifting', name: 'Boom & Lifting Gear', icon: '🏗️', productCount: 156 },
  { id: 'chassis-structure', name: 'Chassis & Structure', icon: '🔩', productCount: 89 },
  { id: 'electricals', name: 'Electricals', icon: '⚡', productCount: 234 },
  { id: 'filters-lubes', name: 'Filters & Lubes', icon: '🛢️', productCount: 178 },
  { id: 'hydraulics', name: 'Hydraulics', icon: '💧', productCount: 145 },
  { id: 'engine', name: 'Engine Parts', icon: '⚙️', productCount: 267 },
  { id: 'brakes', name: 'Brakes & Safety', icon: '🛑', productCount: 98 },
  { id: 'transmission', name: 'Transmission', icon: '🔄', productCount: 112 },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Hydraulic Oil Filter',
    partNumber: 'ACE-HOF-2024',
    categoryId: 'filters-lubes',
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
    name: 'Hydraulic Pump Assembly',
    partNumber: 'ACE-HPA-1089',
    categoryId: 'hydraulics',
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
    partNumber: 'ACE-ALT-2480',
    categoryId: 'electricals',
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
    name: 'Boom Cylinder Kit',
    partNumber: 'ACE-BCK-4500',
    categoryId: 'boom-lifting',
    price: 45000,
    image: '/placeholder.svg',
    inStock: false,
    stockQuantity: 0,
    deliveryTime: '5-7 days',
  },
  {
    id: 'p5',
    name: 'Brake Pad Set - Heavy Duty',
    partNumber: 'ACE-BPS-1200',
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
    partNumber: 'ACE-TGK-8800',
    categoryId: 'transmission',
    price: 28000,
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 5,
    deliveryTime: '2-3 days',
  },
  {
    id: 'p7',
    name: 'Engine Air Filter',
    partNumber: 'ACE-EAF-3300',
    categoryId: 'filters-lubes',
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
    name: 'Chassis Frame Bracket',
    partNumber: 'ACE-CFB-5500',
    categoryId: 'chassis-structure',
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
    name: 'Pick & Carry Crane',
    model: 'ACE 14XW',
    serialNumber: 'PC14XW-2024-0045',
    image: '/placeholder.svg',
    status: 'active',
    lastServiceDate: '2024-12-15',
    nextServiceDue: '2025-03-15',
  },
  {
    id: 'e2',
    name: 'Tower Crane',
    model: 'ACE TC-5013',
    serialNumber: 'TC5013-2023-0128',
    image: '/placeholder.svg',
    status: 'maintenance',
    lastServiceDate: '2025-01-20',
    nextServiceDue: '2025-02-20',
  },
  {
    id: 'e3',
    name: 'Fork Lift',
    model: 'ACE AF-30D',
    serialNumber: 'AF30D-2024-0089',
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
    subtitle: 'Swift, Secure, Reliable - Get parts in 2-4 hours',
    discount: '₹500 OFF',
    bgColor: 'bg-gradient-ace',
    validUntil: '2025-02-28',
  },
  {
    id: 'o2',
    title: 'Bulk Order Discount',
    subtitle: 'Order 10+ genuine parts & save big',
    discount: '15% OFF',
    bgColor: 'bg-gradient-ace',
    validUntil: '2025-03-15',
  },
  {
    id: 'o3',
    title: 'Filter Festival',
    subtitle: 'All filters & lubes on special offer',
    discount: '20% OFF',
    bgColor: 'bg-gradient-gold',
    validUntil: '2025-02-20',
  },
];

export const cartItems = [
  { productId: 'p1', quantity: 2 },
  { productId: 'p5', quantity: 1 },
];
