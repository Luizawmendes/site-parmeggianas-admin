export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

export interface OrderItem {
  name: string;
  quantity: number;
  observation?: string;
  price?: number;
}

export type OrderStatus = 'Recebido' | 'Em Preparo' | 'Pronto' | 'Saiu para Entrega' | 'Em Andamento' | 'Entregue';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  source: 'WhatsApp' | 'Instagram' | 'Facebook';
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  deliveryType: 'entrega' | 'retirada' | 'desconhecido';
  deliveryAddress?: string;
  observations?: string;
  motoboyId?: string;
  createdAt: string;
  updatedAt: string;
  timeStarted?: string;
  timeFinished?: string;
  rawMessage?: string;
}

export interface Motoboy {
  id: string;
  name: string;
  phone: string;
  pixKey: string;
  active: boolean;
  dailyTrips: number;
  dailyEarnings: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
