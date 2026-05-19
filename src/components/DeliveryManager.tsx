import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Motoboy } from '../types';
import React, { useState, useEffect } from 'react';
import { Bike, Plus, Phone, CreditCard, Trash2, CheckCircle, Package } from 'lucide-react';
import { useOrders } from '../lib/db';

export const DeliveryManager = () => {
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const { orders } = useOrders(); 
  const readyOrders = orders.filter(o => o.status === 'Pronto');
  const deliveryOrders = orders.filter(o => ['Saiu para Entrega', 'Em Andamento'].includes(o.status));
  const [isAdding, setIsAdding] = useState(false);
  const [newBot, setNewBot] = useState<Partial<Motoboy>>({ name: '', phone: '', pixKey: '', active: true, dailyTrips: 0, dailyEarnings: 0 });

  useEffect(() => {
    return onSnapshot(collection(db, 'motoboys'), (snap) => {
      setMotoboys(snap.docs.map(d => ({ id: d.id, ...d.data() } as Motoboy)));
    });
  }, []);

  const addMotoboy = async () => {
    await addDoc(collection(db, 'motoboys'), newBot);
    setNewBot({ name: '', phone: '', pixKey: '', active: true, dailyTrips: 0, dailyEarnings: 0 });
    setIsAdding(false);
  };

  const updateStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date().toISOString()
    });
  };

  const dispatchOrder = async (orderId: string, motoboyId: string) => {
    const motoboy = motoboys.find(m => m.id === motoboyId);
    if (!motoboy) return;

    await updateDoc(doc(db, 'orders', orderId), {
      motoboyId,
      status: 'Saiu para Entrega',
      updatedAt: new Date().toISOString()
    });

    await updateDoc(doc(db, 'motoboys', motoboyId), {
      dailyTrips: (motoboy.dailyTrips || 0) + 1,
      dailyEarnings: (motoboy.dailyEarnings || 0) + 5 // R$ 5,00 por corrida mock
    });
  };

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Entregas</h1>
          <p className="text-slate-500">Gestão de motoboys e logística urbana</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white h-12 px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all"
        >
          <Plus size={20} /> Cadastrar Motoboy
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Motoboys List */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-8 overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
             <Bike className="text-orange-500" /> Motoboys Ativos
          </h2>
          <div className="space-y-4">
            {motoboys.map((bot) => (
              <div key={bot.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                   <div>
                    <h3 className="font-bold text-slate-900 text-lg">{bot.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                      <Phone size={12} /> {bot.phone}
                    </div>
                   </div>
                   <div className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-orange-600 border border-slate-100">
                      {bot.dailyTrips} CORRIDAS
                   </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl mb-4 text-xs font-bold text-slate-600">
                  <CreditCard size={14} className="text-slate-300" />
                  PIX: <span className="font-mono text-slate-900">***{bot.pixKey.slice(-4)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
                  <span className="text-xs font-bold text-slate-400">GANHO HOJE</span>
                  <span className="text-xl font-black text-slate-900">R$ {(bot.dailyEarnings || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Deliveries */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col overflow-hidden">
           <h2 className="text-xl font-bold mb-6 text-slate-900">Entregas em Curso</h2>
           <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {deliveryOrders.map(order => {
                const bot = motoboys.find(b => b.id === order.motoboyId);
                return (
                  <div key={order.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="flex justify-between mb-3">
                      <span className="font-bold text-slate-900">#{order.id.slice(-4).toUpperCase()}</span>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full ${order.status === 'Em Andamento' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {order.status === 'Em Andamento' ? 'EM ANDAMENTO' : 'SAIU PARA ENTREGA'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">{order.customerName}</p>
                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1"><Bike size={12} /> {bot?.name || 'Motoboy'}</p>
                    
                    <div className="flex gap-2">
                      {order.status === 'Saiu para Entrega' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'Em Andamento')}
                          className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all"
                        >
                          Marcar em Rota
                        </button>
                      )}
                      <button 
                        onClick={() => updateStatus(order.id, 'Entregue')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all"
                      >
                        Entrega Finalizada
                      </button>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Ready to Dispatch */}
        <div className="xl:col-span-3 bg-slate-900 text-white rounded-[2.5rem] p-8 flex flex-col shadow-2xl overflow-hidden">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
             <Package className="text-orange-500" /> Aguardando
          </h2>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {readyOrders.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-600 text-sm text-center border-2 border-dashed border-slate-800 rounded-3xl">
                <p>Nenhum pedido pronto.</p>
              </div>
            ) : readyOrders.map((order) => (
              <div key={order.id} className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono font-bold text-orange-500">#{order.id.slice(-4).toUpperCase()}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{order.customerName}</span>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">Selecione o motoboy:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {motoboys.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => dispatchOrder(order.id, bot.id)}
                        className="w-full p-3 bg-slate-700 hover:bg-orange-600 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between group"
                      >
                        {bot.name}
                        <Bike size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Mock */}
      {isAdding && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Novo Motoboy</h2>
                <div className="space-y-4">
                  <input placeholder="Nome" value={newBot.name} onChange={e => setNewBot({...newBot, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                  <input placeholder="Telefone" value={newBot.phone} onChange={e => setNewBot({...newBot, phone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                  <input placeholder="Chave PIX" value={newBot.pixKey} onChange={e => setNewBot({...newBot, pixKey: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsAdding(false)} className="flex-1 p-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                    <button onClick={addMotoboy} className="flex-1 p-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-600">Salvar</button>
                  </div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};
