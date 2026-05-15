import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart,
  FileText,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { dbService } from '../services/db';
import { Product, Category, Movement } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const p = await dbService.list('products') as Product[];
      const c = await dbService.list('categories') as Category[];
      const m = await dbService.list('movements') as Movement[];
      setProducts(p);
      setCategories(c);
      setMovements(m);
      setLoading(false);
    }
    loadData();
  }, []);

  // Calculate stock value by category
  const stockByCat = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const value = catProducts.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);
    return { name: cat.name, value };
  }).filter(c => c.value > 0);

  // Top products by stock value
  const topProducts = [...products]
    .sort((a, b) => (b.currentStock * b.sellingPrice) - (a.currentStock * a.sellingPrice))
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      valor: p.currentStock * p.sellingPrice,
      stock: p.currentStock
    }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const handleExportFullReport = () => {
    const ws = XLSX.utils.json_to_sheet(products.map(p => ({
      Nome: p.name,
      Codigo: p.code,
      Stock: p.currentStock,
      Preco: p.sellingPrice,
      Valor_Total: p.currentStock * p.sellingPrice
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Geral");
    XLSX.writeFile(wb, "relatorio_stock_completo.xlsx");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-text-main">Relatórios & Analítica</h1>
          <p className="text-[13px] text-brand-text-muted">Dados consolidados do seu inventário.</p>
        </div>
        <button 
          onClick={handleExportFullReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-[12px] font-bold hover:bg-blue-700 transition-all uppercase tracking-wider shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Extrair Relatório Geral</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <div className="panel-header">
             <div className="flex items-center gap-3">
                <PieChartIcon className="w-4 h-4 text-blue-600" />
                <h3 className="panel-title">Valor de Stock por Categoria</h3>
             </div>
          </div>
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockByCat}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockByCat.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                 />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
             <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="panel-title">Top 5 Produtos (Maior Valor)</h3>
             </div>
          </div>
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart layout="vertical" data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="valor" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-brand-sidebar text-white rounded-lg p-6 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Valor em Stock (Custo)</p>
            <h4 className="text-2xl font-black">
              {formatCurrency(products.reduce((acc, p) => acc + (p.currentStock * p.buyingPrice), 0))}
            </h4>
          </div>
          <div className="space-y-1 border-l border-white/5 md:pl-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Potencial Faturação</p>
            <h4 className="text-2xl font-black text-blue-400">
              {formatCurrency(products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0))}
            </h4>
          </div>
          <div className="space-y-1 border-l border-white/5 md:pl-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Margem Lucro Projetada</p>
            <h4 className="text-2xl font-black text-emerald-400">
              {formatCurrency(products.reduce((acc, p) => acc + (p.currentStock * (p.sellingPrice - p.buyingPrice)), 0))}
            </h4>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] -mr-24 -mt-24 rounded-full"></div>
      </div>
    </div>
  );
}
