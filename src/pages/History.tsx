import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Download,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { orderBy } from 'firebase/firestore';
import { dbService } from '../services/db';
import { Movement, Product } from '../types';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import * as XLSX from 'xlsx';

export default function History() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubMove = dbService.onSnapshot('movements', [orderBy('date', 'desc')], (docs) => {
      setMovements(docs as Movement[]);
      setLoading(false);
    });

    dbService.list('products').then(data => setProducts(data as Product[]));

    return () => unsubMove();
  }, []);

  const filteredMovements = movements.filter(m => {
    const product = products.find(p => p.id === m.productId);
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product?.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || m.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleExportExcel = () => {
    const data = filteredMovements.map(m => {
      const product = products.find(p => p.id === m.productId);
      return {
        Data: formatDate(m.date),
        Tipo: m.type === 'IN' ? 'Entrada' : 'Saída',
        Produto: product?.name || 'N/A',
        Quantidade: m.quantity,
        Preço_Unit: m.price,
        Total: m.quantity * m.price,
        Observação: m.observation || ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimentações");
    XLSX.writeFile(wb, "historico_de_stock.xlsx");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Movimentações</h1>
          <p className="text-slate-500">Acompanhe todas as entradas e saídas de stock.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Histórico</span>
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por produto ou código..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none bg-white appearance-none min-w-[150px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos Tipos</option>
              <option value="IN">Entradas</option>
              <option value="OUT">Saídas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Qtd</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.map((m) => {
                const product = products.find(p => p.id === m.productId);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(m.date)}
                    </td>
                    <td className="px-6 py-4">
                      {m.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <ArrowDownLeft className="w-3 h-3" />
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          <ArrowUpRight className="w-3 h-3" />
                          Saída
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{product?.name || 'Produto Removido'}</div>
                      <div className="text-xs text-slate-500 font-mono">{product?.code}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-900 line">
                      {m.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {formatCurrency(m.quantity * m.price)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {m.observation || '-'}
                    </td>
                  </tr>
                );
              })}
              {filteredMovements.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
