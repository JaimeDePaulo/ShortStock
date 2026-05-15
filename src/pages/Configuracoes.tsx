import { useState, useEffect, ReactNode, FormEvent } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Save,
  Tag
} from 'lucide-react';
import { dbService } from '../services/db';
import { Category } from '../types';
import { useAuth } from '../components/AuthProvider';

export default function Config() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dbService.onSnapshot('categories', [], (docs) => {
      setCategories(docs as Category[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await dbService.add('categories', { name: newCatName });
    setNewCatName('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta categoria?')) {
      await dbService.delete('categories', id);
    }
  };

  if (!isAdmin) return <div className="p-8 text-center">Acesso Negado</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
        <p className="text-slate-500">Gira as definições globais do StockMaster.</p>
      </header>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Tag className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">Gestão de Categorias</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome da nova categoria (ex: Eletrónicos)" 
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
            />
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Adicionar</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-400">
                    {cat.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-900">{cat.name}</span>
                </div>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900">Preferências da Empresa</h3>
        </div>
        <div className="p-6 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Nome da Empresa</label>
                 <input type="text" defaultValue="StockMaster Lda" className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" readOnly />
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Moeda</label>
                 <input type="text" defaultValue="EUR (€)" className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" readOnly />
              </div>
           </div>
           <p className="text-xs text-slate-400 mt-4 italic">Algumas definições estão bloqueadas para a versão de demonstração.</p>
        </div>
      </section>
    </div>
  );
}
