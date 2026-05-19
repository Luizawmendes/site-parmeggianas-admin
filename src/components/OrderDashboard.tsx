import React, { useState } from 'react';
import { useOrders, updateOrderStatus } from '../lib/db';
import { Bike, Search, Filter, Plus, Phone, User, MapPin, Store } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const OrderDashboard = () => {
  const { orders, loading } = useOrders();
  const [filter, setFilter] = useState<string>('all');

  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchLow) ||
      o.id.toLowerCase().includes(searchLow) ||
      o.items.some(i => i.name.toLowerCase().includes(searchLow));
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    active: orders.filter(o => o.status !== 'Entregue').length,
    todayRevenue: orders.filter(o => {
      const d = new Date(o.createdAt);
      const today = new Date();
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    }).reduce((acc, o) => acc + o.total, 0)
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Pedidos</h1>
          <p className="text-slate-500">Acompanhamento em tempo real da operação</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3">
             <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Plus size={16} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Vendas Hoje</p>
                <p className="text-xl font-black text-slate-900 leading-none mt-1">R$ {stats.todayRevenue.toFixed(2)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-4">
        {['Recebido', 'Em Preparo', 'Pronto', 'Saiu para Entrega', 'Entregue'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? 'all' : s)}
            className={`p-4 rounded-3xl border transition-all text-left group ${
              filter === s ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest ${filter === s ? 'text-orange-100' : 'text-slate-400'}`}>{s}</p>
            <p className="text-2xl font-black mt-1">
              {orders.filter(o => o.status === s).length}
            </p>
          </button>
        ))}
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente, id ou prato..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50">
            <Filter size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedido</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente / Canal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Itens</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-slate-900">#{order.id.slice(-4).toUpperCase()}</span>
                    <p className="text-[10px] text-slate-400 font-medium">{format(new Date(order.createdAt), "HH:mm")}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        {order.deliveryType === 'entrega' ? <Bike size={14} /> : <Store size={14} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] text-orange-600 font-bold uppercase">{order.source}</p>
                           <span className="text-slate-300">•</span>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{order.deliveryType || 'Retirada'}</p>
                        </div>
                        {order.deliveryAddress && (
                           <p className="text-[10px] text-slate-400 truncate max-w-[150px] flex items-center gap-1 mt-0.5">
                             <MapPin size={10} /> {order.deliveryAddress}
                           </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 font-medium">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {order.items.map(i => i.name).join(', ')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900">R$ {order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <Plus size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'Recebido': 'bg-blue-100 text-blue-600 border-blue-200',
    'Em Preparo': 'bg-orange-100 text-orange-600 border-orange-200',
    'Pronto': 'bg-green-100 text-green-600 border-green-200',
    'Saiu para Entrega': 'bg-purple-100 text-purple-600 border-purple-200',
    'Em Andamento': 'bg-orange-100 text-orange-600 border-orange-200',
    'Entregue': 'bg-slate-100 text-slate-400 border-slate-200',
  };

  const display: any = {
    'Entregue': 'Entrega Finalizada'
  };

  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${styles[status]}`}>
      {display[status] || status}
    </span>
  );
};
