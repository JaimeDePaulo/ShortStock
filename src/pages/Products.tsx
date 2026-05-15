import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  AlertCircle,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../services/db';
import { Product, Category } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { useAuth } from '../components/AuthProvider';
import * as XLSX from 'xlsx';

export default function Products() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubProducts = dbService.onSnapshot('products', [], (docs) => {
      setProducts(docs as Product[]);
      setLoading(false);
    });

    const unsubCats = dbService.onSnapshot('categories', [], (docs) => {
      setCategories(docs as Category[]);
    });

    return () => {
      unsubProducts();
      unsubCats();
    };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este produto?')) {
      await dbService.delete('products', id);
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(products.map(p => ({
      Base: p.code,
      Nome: p.name,
      Preço_Compra: p.buyingPrice,
      Preço_Venda: p.sellingPrice,
      Stock_Atual: p.currentStock,
      Unidade: p.unit
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    XLSX.writeFile(wb, "inventario_produtos.xlsx");
  };

  const handleImportExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      for (const row of data) {
        // Simple mapping: you might need to adjust based on user's excel structure
        const newProduct = {
          name: row.Nome || row.name || 'Produto Importado',
          code: String(row.Base || row.code || Math.random().toString(36).substr(2, 9)),
          buyingPrice: Number(row.Preço_Compra || row.buyingPrice || 0),
          sellingPrice: Number(row.Preço_Venda || row.sellingPrice || 0),
          currentStock: Number(row.Stock_Atual || row.currentStock || 0),
          unit: row.Unidade || row.unit || 'UN',
          minStock: Number(row.Stock_Minimo || row.minStock || 0),
        };
        await dbService.add('products', newProduct);
      }
      alert(`${data.length} produtos importados com sucesso!`);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-brand-text-main">Gestão de Inventário</h1>
          <p className="text-[13px] text-brand-text-muted">Gira o inventário de produtos e stock.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleImportExcel}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-border rounded text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-wider">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar</span>
            </button>
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-border rounded text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-[12px] font-bold hover:bg-blue-700 transition-all uppercase tracking-wider shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Produto</span>
            </button>
          )}
        </div>
      </header>

      <div className="panel flex-1">
        <div className="panel-header bg-slate-50/50">
          <div className="flex flex-1 gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-text-muted" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou código..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-brand-border rounded-md text-[13px] focus:ring-1 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-text-muted" />
                <select 
                  className="pl-9 pr-6 py-1.5 bg-white border border-brand-border rounded-md text-[13px] focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Filtro: Categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
             </div>
          </div>
        </div>
        
        <div className="overflow-auto min-h-0">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[80px]">ID</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Stock</th>
                <th>Preço Venda</th>
                <th className="text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="font-mono text-slate-400 font-bold">#{product.code.slice(-4)}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-brand-border overflow-hidden">
                        {product.imageUrl ? (
                           <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <p className="font-semibold text-slate-800">{product.name}</p>
                        <p className="text-[11px] text-slate-400">{product.unit || 'Unidades'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded border border-slate-200 uppercase">
                      {categories.find(c => c.id === product.categoryId)?.name || 'Geral'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                       <span className={cn(
                         "font-black text-[14px]",
                         product.currentStock <= product.minStock ? "text-rose-600" : "text-slate-900"
                       )}>
                         {product.currentStock}
                       </span>
                       {product.currentStock <= product.minStock && (
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></div>
                       )}
                    </div>
                  </td>
                  <td className="font-bold text-slate-900">
                    {formatCurrency(product.sellingPrice)}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ProductModal 
            product={editingProduct} 
            categories={categories}
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ product, categories, onClose }: { product: Product | null, categories: Category[], onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    code: product?.code || '',
    categoryId: product?.categoryId || '',
    buyingPrice: product?.buyingPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    currentStock: product?.currentStock || 0,
    minStock: product?.minStock || 0,
    unit: product?.unit || 'UN',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (product) {
      await dbService.update('products', product.id, formData);
    } else {
      await dbService.add('products', formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Nome do Produto</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Código</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Categoria</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Seleccione...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Unidade</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Preço Compra</label>
              <input 
                type="number" step="0.01"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.buyingPrice}
                onChange={e => setFormData({...formData, buyingPrice: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Preço Venda</label>
              <input 
                required
                type="number" step="0.01"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.sellingPrice}
                onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Stock Atual</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.currentStock}
                onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Stock Mínimo</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.minStock}
                onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {product ? 'Guardar Alterações' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
