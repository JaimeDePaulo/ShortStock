import { useState, useEffect, FormEvent } from 'react';
import { 
  ArrowDownLeft, 
  Search, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';
import { motion } from 'motion/react';
import { dbService, stockService } from '../services/db';
import { Product, Supplier } from '../types';
import { cn, formatCurrency } from '../lib/utils';

export default function MoveIn() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [supplierId, setSupplierId] = useState('');
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dbService.list('products').then(data => setProducts(data as Product[]));
    dbService.list('suppliers').then(data => setSuppliers(data as Supplier[]));
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    setSubmitting(true);
    setStatus(null);

    try {
      await stockService.registerMovement('IN', selectedProductId, quantity, price, {
        partnerId: supplierId,
        observation
      });
      setStatus({ type: 'success', message: 'Entrada registrada com sucesso!' });
      // Reset form
      setSelectedProductId('');
      setQuantity(0);
      setPrice(0);
      setSupplierId('');
      setObservation('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Erro ao registrar entrada.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Registrar Entrada</h1>
        <p className="text-slate-500">Adicione stock ao inventário a partir de uma compra ou reposição.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Produto</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 appearance-none"
                    value={selectedProductId}
                    onChange={e => {
                      const p = products.find(prod => prod.id === e.target.value);
                      setSelectedProductId(e.target.value);
                      if (p) setPrice(p.buyingPrice || 0);
                    }}
                  >
                    <option value="">Seleccione um produto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Quantidade</label>
                  <input 
                    required
                    type="number" min="1"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Preço Compra (Un.)</label>
                  <input 
                    required
                    type="number" step="0.01"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    value={price}
                    onChange={e => setPrice(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Fornecedor</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                >
                  <option value="">Sem fornecedor</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Observações</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg min-h-[100px]"
                  placeholder="Motivo da entrada, número da factura do fornecedor..."
                  value={observation}
                  onChange={e => setObservation(e.target.value)}
                />
              </div>
            </div>

            {status && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className={cn(
                  "p-4 rounded-lg flex items-center gap-3",
                  status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{status.message}</p>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={submitting || !selectedProductId}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {submitting ? 'A registrar...' : 'Confirmar Entrada'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center underline decoration-blue-500">Resumo da Movimentação</h3>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Produto Seleccionado</p>
                  <p className="font-bold text-slate-900">{selectedProduct.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{selectedProduct.code}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Stock Atual</span>
                  <span className="font-bold">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Entrada</span>
                  <span className="font-bold text-emerald-600">+{quantity}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Novo Saldo</span>
                  <span className="font-bold text-blue-600">{selectedProduct.currentStock + quantity}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(quantity * price)}</span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Package className="w-10 h-10 opacity-20" />
                <p className="text-sm">Seleccione um produto para ver o resumo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
