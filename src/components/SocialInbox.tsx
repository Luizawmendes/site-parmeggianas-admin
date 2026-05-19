import React, { useState } from 'react';
import { MessageCircle, Instagram, Facebook, Check, X, Edit2, Clock, Languages, MapPin, Bike, Store, AlertCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createOrder, useMenuItems } from '../lib/db';
import { OrderItem } from '../types';

interface SocialMessage {
  id: string;
  source: 'WhatsApp' | 'Instagram' | 'Facebook';
  user: string;
  text: string;
  time: string;
  status: 'pending' | 'interpreting' | 'ready';
}

export const SocialInbox = () => {
  const { items: menuItems } = useMenuItems();
  const [messages, setMessages] = useState<SocialMessage[]>([
    { id: '1', source: 'WhatsApp', user: 'Maria Silva', text: 'Olá, gostaria de 2 parmegianas de frango com fritas e uma coca 2 litros. É pra entrega na Rua das Flores, 123.', time: '14:30', status: 'pending' },
    { id: '2', source: 'Instagram', user: '@joao_food', text: 'Boa tarde! Tem panqueca de carne? Se tiver quero 3 e 1 de presunto e queijo. Sem cebola nas de carne por favor.', time: '14:35', status: 'pending' },
  ]);

  const [interpretingId, setInterpretingId] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);

  const interpretMessage = async (msg: SocialMessage) => {
    setInterpretingId(msg.id);
    try {
      const res = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: msg.text,
          contactName: msg.user,
          menuItems: menuItems
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro na interpretação');
      }

      setReviewOrder({ ...data, source: msg.source, originalMsg: msg });
    } catch (e: any) {
      alert(`Erro na IA: ${e.message}`);
      console.error(e);
    } finally {
      setInterpretingId(null);
    }
  };

  const confirmOrder = async () => {
    if (!reviewOrder || !reviewOrder.items) return;
    await createOrder({
      customerName: reviewOrder.customerName || reviewOrder.originalMsg.user,
      source: reviewOrder.source,
      items: reviewOrder.items,
      total: reviewOrder.totalGuess || 0,
      deliveryType: reviewOrder.deliveryType || 'desconhecido',
      deliveryAddress: reviewOrder.deliveryAddress || '',
      observations: (reviewOrder.items || []).map((i: any) => i.observation).filter(Boolean).join('. '),
      status: 'Recebido',
      rawMessage: reviewOrder.originalMsg.text
    });
    setMessages(prev => prev.filter(m => m.id !== reviewOrder.originalMsg.id));
    setReviewOrder(null);
    console.log(`Enviando confirmação para ${reviewOrder.customerName}: Pedido confirmado! Previsão 45 min.`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Inbox List */}
      <div className="w-1/3 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Entrada Social</h2>
          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
            {messages.length} NOVAS
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => interpretMessage(msg)}
              disabled={interpretingId === msg.id}
              className={`w-full p-6 text-left border-b border-slate-50 transition-all flex gap-4 hover:bg-slate-50 relative ${interpretingId === msg.id ? 'opacity-50' : ''}`}
            >
              <div className={`p-3 rounded-2xl ${
                msg.source === 'WhatsApp' ? 'bg-green-100 text-green-600' :
                msg.source === 'Instagram' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {msg.source === 'WhatsApp' ? <MessageCircle size={20} /> : 
                 msg.source === 'Instagram' ? <Instagram size={20} /> : <Facebook size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{msg.user}</h3>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock size={10} /> {msg.time}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{msg.text}</p>
              </div>
              {interpretingId === msg.id && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                    <span className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    IA Interpretando...
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Review Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-6">
        <AnimatePresence mode="wait">
          {reviewOrder ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
                  <Languages size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Revisar Pedido IA</h2>
                  <p className="text-slate-500 text-sm">Extração automática de {reviewOrder.source}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Cliente</label>
                    <input 
                      type="text" 
                      defaultValue={reviewOrder.customerName || ''} 
                      onChange={(e) => setReviewOrder({...reviewOrder, customerName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Modalidade</label>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setReviewOrder({...reviewOrder, deliveryType: 'entrega'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${reviewOrder.deliveryType === 'entrega' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                       >
                         <Bike size={16} /> ENTREGA
                       </button>
                       <button 
                         onClick={() => setReviewOrder({...reviewOrder, deliveryType: 'retirada'})}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${reviewOrder.deliveryType === 'retirada' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                       >
                         <Store size={16} /> RETIRADA
                       </button>
                    </div>
                  </div>
                </div>

                {reviewOrder.deliveryType === 'entrega' && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Endereço de Entrega</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                      <input 
                        type="text" 
                        defaultValue={reviewOrder.deliveryAddress || ''} 
                        placeholder="Não identificado"
                        onChange={(e) => setReviewOrder({...reviewOrder, deliveryAddress: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Itens Detectados</label>
                  <div className="space-y-3">
                    {reviewOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="bg-white border border-slate-200 rounded-lg w-10 h-10 flex items-center justify-center font-bold text-slate-900 text-xs">
                          {item.quantity}x
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            defaultValue={item.name} 
                            onChange={(e) => {
                              const newItems = [...reviewOrder.items];
                              newItems[idx].name = e.target.value;
                              setReviewOrder({...reviewOrder, items: newItems});
                            }}
                            className="bg-transparent border-none p-0 font-bold text-slate-900 focus:ring-0 w-full text-sm"
                          />
                          <input 
                            type="text" 
                            defaultValue={item.observation || ''} 
                            placeholder="Adicionar observação..."
                            onChange={(e) => {
                              const newItems = [...reviewOrder.items];
                              newItems[idx].observation = e.target.value;
                              setReviewOrder({...reviewOrder, items: newItems});
                            }}
                            className="bg-transparent border-none p-0 text-orange-600 text-xs font-medium focus:ring-0 w-full italic"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {reviewOrder.suggestedQuestions?.length > 0 && (
                   <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-amber-700 mb-3">
                        <AlertCircle size={18} />
                        <span className="font-bold text-sm">IA Sugere perguntar:</span>
                      </div>
                      <div className="space-y-2">
                        {reviewOrder.suggestedQuestions.map((q: string, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-amber-100 text-xs font-medium text-slate-700">
                            {q}
                            <button className="text-orange-500 hover:text-orange-600"><Send size={14} /></button>
                          </div>
                        ))}
                      </div>
                   </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Sugerido</span>
                    <span className="text-3xl font-black text-slate-900">R$ {(reviewOrder.totalGuess || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setReviewOrder(null)}
                      className="px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmOrder}
                      className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/20 text-sm"
                    >
                      <Check size={20} /> Lançar no Sistema
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Mensagem Original</span>
                <p className="text-xs text-slate-600 italic">"{reviewOrder.originalMsg.text}"</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-[3rem]"
            >
              <div className="p-6 bg-slate-50 rounded-full mb-6">
                <MessageCircle size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Nenhum pedido selecionado</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">Selecione uma mensagem da caixa de entrada para que a IA processe automaticamente.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
