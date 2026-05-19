import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditLog } from '../types';
import { Clock, Shield, Lock, FileText, Trash2, Eye, Download, Info, Save } from 'lucide-react';
import { format } from 'date-fns';

export const AdminSettings = () => {
  const [workingDays, setWorkingDays] = useState(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']);
  const [hours, setHours] = useState({ open: '10:00', close: '22:00' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'restaurant'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.workingDays) setWorkingDays(data.workingDays);
        if (data.hours) setHours(data.hours);
      }
    });
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'config', 'restaurant'), {
        workingDays,
        hours,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      await setDoc(doc(db, 'config', 'restaurant'), {
        workingDays,
        hours,
        updatedAt: new Date().toISOString()
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="h-full flex flex-col gap-8 overflow-y-auto pr-2 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações & Segurança</h1>
          <p className="text-slate-500">Controles administrativos e operacionais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
               <Clock className="text-orange-500" /> Horário de Funcionamento
             </h2>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Dias de Operação</label>
                  <div className="flex flex-wrap gap-2">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => (
                      <button 
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          workingDays.includes(day) 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Horário Abertura</label>
                    <input 
                      type="time" 
                      value={hours.open} 
                      onChange={e => setHours({...hours, open: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none font-bold" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Horário Fechamento</label>
                    <input 
                      type="time" 
                      value={hours.close} 
                      onChange={e => setHours({...hours, close: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none font-bold" 
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                   <button 
                    onClick={saveConfig}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
                   >
                     <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                   </button>
                </div>

                <div className="pt-4 flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-green-700">Loja Ativa no Momento</span>
                  </div>
                  <span className="text-[10px] font-black text-green-600 uppercase">ONLINE</span>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
               <Shield className="text-orange-500" /> Conformidade LGPD
             </h2>
             <div className="space-y-4">
                <div className="p-6 border border-slate-100 rounded-3xl flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><FileText size={20} /></div>
                     <div>
                       <p className="font-bold text-slate-800">Exportar Dados de Cliente</p>
                       <p className="text-xs text-slate-400">Relatório CSV completo do histórico.</p>
                     </div>
                  </div>
                  <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><Eye size={20} /></button>
                </div>
                <div className="p-6 border border-slate-100 rounded-3xl flex items-center justify-between hover:bg-red-50/30 transition-all group cursor-pointer border-red-50">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-red-100 text-red-500 rounded-2xl"><Trash2 size={20} /></div>
                     <div>
                       <p className="font-bold text-red-900">Excluir Dados (Esquecimento)</p>
                       <p className="text-xs text-red-400">Remove permanentemente registros.</p>
                     </div>
                  </div>
                  <button className="p-3 text-red-200 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <h3 className="text-xl font-bold mb-4 relative z-10">Suporte Parmeggianas</h3>
            <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed">
              Sistema de gestão inteligente v2.0. Em caso de dúvidas técnicas ou problemas de integração, acione nossa equipe.
            </p>
            <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-xs hover:bg-orange-50 transition-all relative z-10">
              Falar com Suporte
            </button>
            <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12">
               <Shield size={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
