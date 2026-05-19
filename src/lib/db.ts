import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import { Order, MenuItem, Motoboy, AuditLog } from '../types';

export const useOrders = (statusFilter?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    if (statusFilter) {
      q = query(collection(db, 'orders'), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }
    
    return onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
  }, [statusFilter]);

  return { orders, loading };
};

export const useMenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
      setLoading(false);
    });
  }, []);

  return { items, loading };
};

export const createOrder = async (order: Partial<Order>) => {
  return await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'Recebido',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const updates: any = { status, updatedAt: new Date().toISOString() };
  if (status === 'Em Preparo') updates.timeStarted = new Date().toISOString();
  if (status === 'Pronto') updates.timeFinished = new Date().toISOString();
  
  await updateDoc(doc(db, 'orders', orderId), updates);
};

export const logAction = async (userId: string, userName: string, action: string, details: string) => {
  await addDoc(collection(db, 'auditLogs'), {
    userId,
    userName,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
};

import { useState, useEffect } from 'react';
