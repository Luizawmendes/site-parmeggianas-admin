import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  ClipboardList, 
  ChefHat, 
  Bike, 
  BarChart3, 
  Settings, 
  LogOut,
  UtensilsCrossed,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const { role, logout, user } = useAuth();

  const menuItems = [
    { id: 'orders', label: 'Pedidos', icon: ClipboardList, roles: ['owner', 'attendant'] },
    { id: 'social', label: 'Canais Sociais', icon: MessageSquare, roles: ['owner', 'attendant'] },
    { id: 'kitchen', label: 'Cozinha', icon: ChefHat, roles: ['owner', 'cook', 'attendant'] },
    { id: 'delivery', label: 'Entregas', icon: Bike, roles: ['owner', 'attendant'] },
    { id: 'inventory', label: 'Cardápio', icon: UtensilsCrossed, roles: ['owner'] },
    { id: 'dashboard', label: 'Relatórios', icon: BarChart3, roles: ['owner'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['owner'] },
  ];

  const filteredMenu = menuItems.filter(item => role && item.roles.includes(role));

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-white">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-orange-500 rounded-lg">
          <UtensilsCrossed size={24} />
        </div>
        <h1 className="font-bold text-lg leading-tight">Parmeggianas<br />& Panquecas</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentTab === item.id 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 mb-4">
          <img 
            src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
            className="w-10 h-10 rounded-full border-2 border-orange-500/30"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.displayName || 'Usuário'}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};
