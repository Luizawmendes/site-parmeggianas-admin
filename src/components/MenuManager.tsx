import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MenuItem } from '../types';
import { Plus, Edit2, Trash2, Search, Filter, ToggleLeft as Toggle } from 'lucide-react';

export const MenuManager = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, 'menuItems'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
    });
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = async (item: MenuItem) => {
    await updateDoc(doc(db, 'menuItems', item.id), { available: !item.available });
  };

  const deleteItem = async (id: string) => {
    if (confirm('Deseja excluir este item do cardápio?')) {
      await deleteDoc(doc(db, 'menuItems', id));
    }
  };

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão do Cardápio</h1>
          <p className="text-slate-500">Configure pratos, preços e disponibilidade</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white h-12 px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all"
        >
          <Plus size={20} /> Adicionar Prato
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar no cardápio..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-4 overflow-x-auto">
          {['Todos', 'Parmeggianas', 'Panquecas', 'Massas', 'Bebidas'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold px-2 transition-colors ${activeCategory === cat ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2">
        {filteredItems.map((item) => (
          <div key={item.id} className={`bg-white border p-6 rounded-[2rem] transition-all ${item.available ? 'border-slate-100 shadow-sm' : 'border-slate-100 opacity-60 grayscale'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                {item.category}
              </span>
              <button 
                onClick={() => toggleAvailability(item)}
                className={`p-2 rounded-xl transition-colors ${item.available ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}
              >
                <Toggle size={20} className={item.available ? 'rotate-180' : ''} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-4">{item.description}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
               <div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Preço de Venda</span>
                 <span className="text-2xl font-black text-slate-900">R$ {item.price.toFixed(2)}</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setIsEditing(item)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-950 rounded-xl transition-colors">
                   <Edit2 size={16} />
                 </button>
                 <button onClick={() => deleteItem(item.id)} className="p-3 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-colors">
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
           <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
             <Plus size={48} className="text-slate-300 mb-4" />
             <p className="text-slate-400 font-medium">Nenhum item cadastrado no cardápio.</p>
           </div>
        )}
      </div>

       {/* Form Modal Mock */}
       {(isAdding || isEditing) && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">{isEditing ? 'Editar Prato' : 'Novo Prato'}</h2>
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    price: Number(formData.get('price')),
                    category: formData.get('category') as string,
                    available: true
                  };
                  if (isEditing) {
                    updateDoc(doc(db, 'menuItems', isEditing.id), data);
                  } else {
                    addDoc(collection(db, 'menuItems'), data);
                  }
                  setIsAdding(false);
                  setIsEditing(null);
                }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-2">Nome do Produto</label>
                      <input name="name" defaultValue={isEditing?.name} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: Parmeggiana de Frango G" required />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-2">Descrição / Detalhes</label>
                      <textarea name="description" defaultValue={isEditing?.description} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none h-24" placeholder="Ex: Acompanha arroz, fritas e salada" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-2">Preço (R$)</label>
                      <input name="price" type="number" step="0.01" defaultValue={isEditing?.price} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-2">Categoria</label>
                      <select name="category" defaultValue={isEditing?.category} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none" required>
                        <option>Parmeggianas</option>
                        <option>Panquecas</option>
                        <option>Massas</option>
                        <option>Bebidas</option>
                        <option>Sobremesas</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="flex-1 p-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Descartar</button>
                    <button type="submit" className="flex-1 p-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/20">Salvar Alterações</button>
                  </div>
                </form>
            </div>
         </div>
      )}
    </div>
  );
};
