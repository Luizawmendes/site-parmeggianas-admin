import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { UtensilsCrossed } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { login, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl"
      >
        <div className="inline-flex p-4 bg-orange-500 rounded-2xl mb-6 shadow-lg shadow-orange-500/30">
          <UtensilsCrossed size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Parmeggianas & Panquecas</h1>
        <p className="text-slate-400 mb-8 text-lg">Sistema de Administração</p>
        
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-white text-slate-950 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          {loading ? 'Carregando...' : 'Entrar com Google'}
        </button>
        
        <div className="mt-8 flex justify-center gap-2">
          {['recepção', 'cozinha', 'gestão'].map((v) => (
            <span key={v} className="text-[10px] uppercase tracking-widest text-slate-600 px-2 py-1 border border-slate-800 rounded-full">
              {v}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
