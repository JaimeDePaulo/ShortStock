import { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';
import { dbService } from '../services/db';
import { Product, Movement } from '../types';
import { cn, formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    inventoryValue: 0
  });

  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const movementData = [
    { name: 'Seg', entradas: 60, saidas: 40 },
    { name: 'Ter', entradas: 85, saidas: 30 },
    { name: 'Qua', entradas: 45, saidas: 60 },
    { name: 'Qui', entradas: 70, saidas: 45 },
    { name: 'Sex', entradas: 95, saidas: 20 },
  ];

  useEffect(() => {
    async function fetchData() {
      const p = await dbService.list('products') as Product[];
      const m = await dbService.list('movements') as Movement[];

      const totalStock = p.reduce((acc, current) => acc + (current.currentStock || 0), 0);
      const lowStock = p.filter(prod => (prod.currentStock || 0) <= (prod.minStock || 0));
      const inventoryValue = p.reduce((acc, prod) => acc + (prod.currentStock * prod.sellingPrice), 0);
      
      setProducts(p);
      setRecentMovements(m.slice(0, 7));
      setLowStockProducts(lowStock.slice(0, 5));
      setStats({
        totalProducts: p.length,
        totalStock,
        lowStock: lowStock.length,
        inventoryValue
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Produtos Totais" 
          value={stats.totalProducts.toString()} 
          trend={{ type: 'up', text: '12 este mês' }} 
        />
        <StatCard 
          label="Stock Total" 
          value={stats.totalStock.toString()} 
          trend={{ text: 'Uni. em armazém' }} 
        />
        <StatCard 
          label="Valor Inventário" 
          value={formatCurrency(stats.inventoryValue)} 
          trend={{ type: 'up', text: '4.2% margem' }} 
        />
        <StatCard 
          label="Stock Baixo" 
          value={stats.lowStock.toString()} 
          trend={{ type: 'down', text: 'Requer atenção' }}
          danger={stats.lowStock > 0}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="panel h-full">
            <div className="panel-header">
              <h3 className="panel-title">Últimas Movimentações</h3>
              <button className="text-[11px] font-bold px-3 py-1 border border-brand-border rounded hover:bg-slate-50 transition-colors uppercase tracking-wider">Ver Tudo</button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Qtd</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map(m => {
                    const product = products.find(p => p.id === m.productId);
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="font-semibold text-slate-900">{product?.name || 'N/A'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{product?.code}</div>
                        </td>
                        <td>
                          {m.type === 'IN' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Entrada</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">Saída</span>
                          )}
                        </td>
                        <td className="font-bold">
                          {m.type === 'IN' ? '+' : '-'}{m.quantity}
                        </td>
                        <td className="text-slate-500 whitespace-nowrap">14:20</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Chart Panel */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Movimentação Mensal</h3>
            </div>
            <div className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementData}>
                  <Bar dataKey="entradas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between mt-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(day => (
                  <span key={day} className="text-[10px] text-slate-400 font-bold uppercase">{day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="panel flex-1">
            <div className="panel-header">
              <h3 className="panel-title text-rose-600">Alertas Críticos</h3>
            </div>
            <div className="p-2 divide-y divide-slate-100">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3">
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">REF: {p.code}</p>
                  </div>
                  <span className="text-[12px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded">
                    {p.currentStock} restam
                  </span>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="p-4 text-center text-[12px] text-slate-400 italic">Sem alertas de stock baixo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, danger }: { label: string, value: string, trend?: { type?: 'up' | 'down', text: string }, danger?: boolean }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-brand-border shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className={cn("text-2xl font-black tracking-tight", danger ? "text-rose-600" : "text-brand-text-main")}>{value}</h3>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[11px] mt-2 font-bold",
          trend.type === 'up' ? "text-emerald-600" : trend.type === 'down' ? "text-rose-600" : "text-slate-400"
        )}>
          {trend.type === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend.type === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend.text}
        </div>
      )}
    </div>
  );
}
