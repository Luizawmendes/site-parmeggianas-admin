import React from 'react';
import { useOrders, updateOrderStatus } from '../lib/db';
import { ChefHat, Timer, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const KitchenQueue = () => {
  const { orders } = useOrders();
  const queueOrders = orders.filter(o => ['Recebido', 'Em Preparo'].includes(o.status));

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <ChefHat size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Fila da Cozinha</h2>
            <p className="text-slate-500 text-sm">{queueOrders.length} pedidos pendentes</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max overflow-y-auto pr-2">
        <AnimatePresence>
          {queueOrders.map((order, idx) => {
            const waitTimeMin = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
            const isLate = waitTimeMin > 15; // RF11: Alerta visual se mais de X minutos

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex flex-col bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                  isLate ? 'border-red-200 ring-2 ring-red-500/10' : 'border-slate-100'
                }`}
              >
                {/* Header */}
                <div className={`p-4 flex items-center justify-between border-b ${isLate ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">#{order.id.slice(-4).toUpperCase()}</span>
                    {isLate && (
                      <span className="flex items-center gap-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                        <AlertTriangle size={10} /> ATRASADO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Timer size={14} />
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: false, locale: ptBR })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-slate-900 mb-4">{order.customerName}</h3>
                  
                  <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                          {item.quantity}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 leading-tight">{item.name}</p>
                          {/* RF08: Observações em destaque */}
                          {item.observation && (
                            <p className="text-red-600 text-xs font-bold mt-1 bg-red-50 px-2 py-1 rounded inline-block">
                              <span className="flex items-center gap-1 italic italic-underline">
                                <MessageSquare size={10} /> {item.observation}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                  {order.status === 'Recebido' ? (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Em Preparo')}
                      className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      Iniciar Preparo
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Pronto')}
                      className="flex-1 bg-green-600 text-white font-bold py-3 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} /> Concluir
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
