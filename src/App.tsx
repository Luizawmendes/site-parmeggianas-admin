/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Sidebar } from './components/Sidebar';
import Login from './components/Login';
import { OrderDashboard } from './components/OrderDashboard';
import { KitchenQueue } from './components/KitchenQueue';
import { DeliveryManager } from './components/DeliveryManager';
import { SocialInbox } from './components/SocialInbox';
import { FinancialDashboard } from './components/FinancialDashboard';
import { MenuManager } from './components/MenuManager';
import { AdminSettings } from './components/AdminSettings';

function MainApp() {
  const { user, role, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('orders');

  if (loading) return null;
  if (!user) return <Login />;

  const renderContent = () => {
    switch (currentTab) {
      case 'orders': return <OrderDashboard />;
      case 'social': return <SocialInbox />;
      case 'kitchen': return <KitchenQueue />;
      case 'delivery': return <DeliveryManager />;
      case 'inventory': return <MenuManager />;
      case 'dashboard': return <FinancialDashboard />;
      case 'settings': return <AdminSettings />;
      default: return <OrderDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-orange-500/30">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />
      <main className="flex-1 p-8 h-screen overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

