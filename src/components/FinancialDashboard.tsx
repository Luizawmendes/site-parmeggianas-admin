import React from 'react';
import { useOrders } from '../lib/db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, DollarSign, Package, Download, BrainCircuit } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FinancialDashboard = () => {
  const { orders } = useOrders();

  const finishedOrders = orders.filter(o => o.status === 'Entregue');
  const revenue = finishedOrders.reduce((acc, o) => acc + o.total, 0);
  const ticketMedio = finishedOrders.length > 0 ? revenue / finishedOrders.length : 0;

  // Last 7 days chart data
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), i);
    const dayOrders = orders.filter(o => {
      const od = new Date(o.createdAt);
      return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
    });
    return {
      date: format(d, 'dd/MM'),
      value: dayOrders.reduce((acc, o) => acc + o.total, 0),
      count: dayOrders.length
    };
  }).reverse();

  // Pratos mais vendidos
  const pratosMap = new Map();
  orders.forEach(o => o.items.forEach(i => {
    pratosMap.set(i.name, (pratosMap.get(i.name) || 0) + i.quantity);
  }));
  const topPratos = Array.from(pratosMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Relatórios de Desempenho</h1>
          <p className="text-slate-500">Visão estratégica e financeira da marmitaria</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all">
             <Download size={16} /> Exportar PDF
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Faturamento Total" value={`R$ ${revenue.toFixed(2)}`} icon={<DollarSign />} color="orange" trend="+12%" />
        <KPICard title="Pedidos Finalizados" value={finishedOrders.length.toString()} icon={<Package />} color="blue" trend="+5%" />
        <KPICard title="Ticket Médio" value={`R$ ${ticketMedio.toFixed(2)}`} icon={<Users />} color="green" trend="-2%" />
        <KPICard title="Novos Clientes" value="24" icon={<TrendingUp />} color="purple" trend="+18%" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-8 border border-slate-200 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Vendas nos Últimos 7 Dias</h3>
            <div className="flex gap-2">
               <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">Faturamento</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={4} dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pratos */}
        <div className="bg-white p-8 border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-8">Pratos Mais Vendidos</h3>
          <div className="flex-1 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-48 h-48">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={topPratos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topPratos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
               {topPratos.map((p, i) => (
                 <div key={p.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                     <span className="text-sm font-bold text-slate-700">{p.name}</span>
                   </div>
                   <span className="text-sm font-black text-slate-900">{p.value} x</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* RF23 AI Forecasting Placeholder */}
      <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-orange-600/20">
         <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-md">
            <BrainCircuit size={48} className="text-white" />
         </div>
         <div className="flex-1">
            <h3 className="text-2xl font-black mb-2">Previsão IA (Próximos 7 Dias)</h3>
            <p className="text-orange-100 opacity-90 leading-relaxed max-w-xl">
               Com base no histórico de <strong>{orders.length} pedidos</strong>, nossa IA projeta um aumento de <strong>15% na demanda de Parmeggiana de Frango</strong> para a próxima sexta-feira. 
               Sugerimos reforçar o estoque de filé de frango em 20kg.
            </p>
         </div>
         <button className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-50 transition-all">
            Ver Detalhes
         </button>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color, trend }: any) => {
  const colors: any = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-6 border border-slate-100 rounded-[2rem] shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}
