// ACE Central Mock Data - Based on actual ACE equipment categories and website

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
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
  { id: 'fork-lift', name: 'Fork Lift', icon: '🏗️', image: '/images/equipment/fork-lift.png' },
  { id: 'grader', name: 'Grader', icon: '🚜', image: '/images/equipment/grader.png' },
  { id: 'harvester', name: 'Harvester', icon: '🌾', image: '/images/equipment/harvester.png' },
  { id: 'next-gen-cranes', name: 'Next Gen Cranes', icon: '🏗️', image: '/images/equipment/next-gen-cranes.png' },
  { id: 'pick-carry-cranes', name: 'Pick & Carry Cranes', icon: '🔧', image: '/images/equipment/pick-carry-cranes.png' },
  { id: 'rough-terrain-cranes', name: 'Rough Terrain Cranes', icon: '⛰️', image: '/images/equipment/rough-terrain-cranes.png' },
  { id: 'tower-cranes', name: 'Tower Cranes', icon: '🗼', image: '/images/equipment/tower-cranes.png' },
  { id: 'tractor', name: 'Tractor', icon: '🚜', image: '/images/equipment/tractor.png' },
  { id: 'vibratory-roller', name: 'Vibratory Roller', icon: '🛞', image: '/images/equipment/vibratory-roller.png' },
  { id: 'back-hoe', name: 'Back Hoe', icon: '⚙️', image: '/images/equipment/back-hoe.png' },
  { id: 'crawler-cranes', name: 'Crawler Cranes', icon: '🦀', image: '/images/equipment/crawler-cranes.png' },
];

// Part categories based on ACE website
export const categories: Category[] = [
  { id: 'boom-lifting', name: 'Boom & Lifting Gear', icon: '🏗️', image: '/images/categories/boom-lifting-gear.png', productCount: 156 },
  { id: 'chassis-structure', name: 'Chassis & Structure', icon: '🔩', image: '/images/categories/chassis-structure.png', productCount: 89 },
  { id: 'electricals', name: 'Electrical & Safety', icon: '⚡', image: '/images/categories/electricals.png', productCount: 234 },
  { id: 'filters-lubes', name: 'Filters & Lubes', icon: '🛢️', image: '/images/categories/filters-lubes.png', productCount: 178 },
  { id: 'hydraulics', name: 'Hydraulics', icon: '💧', image: '/images/categories/hydraulics.png', productCount: 145 },
  { id: 'engine', name: 'Engine Components', icon: '⚙️', image: '/images/categories/engine-components.png', productCount: 267 },
  { id: 'pneumatics', name: 'Pneumatics (Air Brakes)', icon: '🛑', image: '/images/categories/pneumatics.png', productCount: 98 },
  { id: 'transmission', name: 'Transmission & Drivetrain', icon: '🔄', image: '/images/categories/transmission-drivetrain.png', productCount: 112 },
  { id: 'wheels-suspension', name: 'Wheels & Suspension', icon: '🛞', image: '/images/categories/wheels-suspension.png', productCount: 76 },
  { id: 'winch-system', name: 'Winch System', icon: '⚓', image: '/images/categories/winch-system.png', productCount: 54 },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Gear',
    partNumber: '100082201100',
    categoryId: 'transmission',
    price: 735,
    image: '/images/products/gear.jpg',
    inStock: true,
    stockQuantity: 45,
    deliveryTime: '2-4 hours',
    isPopular: true,
    isFastTrack: true,
  },
  {
    id: 'p2',
    name: 'Pin',
    partNumber: '101026200400',
    categoryId: 'chassis-structure',
    price: 1037,
    image: '/images/products/pin.jpg',
    inStock: true,
    stockQuantity: 32,
    deliveryTime: '2-4 hours',
    isFastTrack: true,
  },
  {
    id: 'p3',
    name: 'Fuel Cock',
    partNumber: '101034400200',
    categoryId: 'engine',
    price: 287,
    image: '/images/products/fuel-cock.jpg',
    inStock: true,
    stockQuantity: 56,
    deliveryTime: '4-6 hours',
    isPopular: true,
  },
  {
    id: 'p4',
    name: 'Alarm',
    partNumber: '101075400200',
    categoryId: 'electricals',
    price: 2248,
    image: '/images/products/alarm.jpg',
    inStock: true,
    stockQuantity: 18,
    deliveryTime: '1-2 days',
  },
  {
    id: 'p5',
    name: 'Hydraulic Valve',
    partNumber: '438022100000',
    categoryId: 'hydraulics',
    price: 20521,
    image: '/images/products/hydraulic-valve.jpg',
    inStock: true,
    stockQuantity: 8,
    deliveryTime: '2-3 days',
    isPopular: true,
  },
  {
    id: 'p6',
    name: 'Water Pump',
    partNumber: '445111100100',
    categoryId: 'engine',
    price: 3010,
    image: '/images/products/water-pump.jpg',
    inStock: true,
    stockQuantity: 24,
    deliveryTime: '1-2 days',
    isFastTrack: true,
  },
  {
    id: 'p7',
    name: 'Control Valve',
    partNumber: '923000003500',
    categoryId: 'hydraulics',
    price: 23419,
    image: '/images/products/control-valve.jpg',
    inStock: true,
    stockQuantity: 6,
    deliveryTime: '3-5 days',
  },
  {
    id: 'p8',
    name: 'Steering Unit',
    partNumber: '926100001100',
    categoryId: 'chassis-structure',
    price: 25162,
    image: '/images/products/steering-unit.jpg',
    inStock: false,
    stockQuantity: 0,
    deliveryTime: '5-7 days',
  },
];

export const equipment: Equipment[] = [
  {
    id: 'e1',
    name: 'Pick & Carry Crane',
    model: 'ACE 14XW',
    serialNumber: 'PC14XW-2024-0045',
    image: '/images/equipment/pick-carry-cranes.png',
    status: 'active',
    lastServiceDate: '2024-12-15',
    nextServiceDue: '2025-03-15',
  },
  {
    id: 'e2',
    name: 'Tower Crane',
    model: 'ACE TC-5013',
    serialNumber: 'TC5013-2023-0128',
    image: '/images/equipment/tower-cranes.png',
    status: 'maintenance',
    lastServiceDate: '2025-01-20',
    nextServiceDue: '2025-02-20',
  },
  {
    id: 'e3',
    name: 'Fork Lift',
    model: 'ACE AF-30D',
    serialNumber: 'AF30D-2024-0089',
    image: '/images/equipment/fork-lift.png',
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
