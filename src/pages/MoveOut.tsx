import { useState, useEffect, FormEvent } from 'react';
import { 
  ArrowUpRight, 
  Search, 
  Minus, 
  AlertCircle,
  CheckCircle2,
  Package,
  Printer,
  FileText,
  ScanLine
} from 'lucide-react';
import { motion } from 'motion/react';
import { dbService, stockService } from '../services/db';
import { Product, Customer } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import BarcodeScanner from '../components/ui/BarcodeScanner';

export default function MoveOut() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    dbService.list('products').then(data => setProducts(data as Product[]));
    dbService.list('customers').then(data => setCustomers(data as Customer[]));
  }, []);

  const handleScan = (code: string) => {
    const product = products.find(p => p.code === code);
    if (product) {
      setSelectedProductId(product.id);
      setStatus(null);
    } else {
      setStatus({ type: 'error', message: 'Produto não encontrado com este código.' });
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedCustomer = customers.find(c => c.id === customerId);

  const generatePDF = (id: string, movementData: any) => {
    const doc = new jsPDF({
      format: [80, 150] // POS Style
    });

    const margin = 5;
    let y = 10;

    doc.setFontSize(12);
    doc.text('StockMaster ERP', 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text('Recibo de Saída #' + id.slice(-6).toUpperCase(), 40, y, { align: 'center' });
    y += 10;

    doc.text('Data: ' + new Date().toLocaleString(), margin, y);
    y += 5;
    doc.text('Cliente: ' + (selectedCustomer?.name || 'Cliente Final'), margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Prod', 'Qtd', 'Preço', 'Total']],
      body: [
        [
          selectedProduct?.name || '',
          quantity.toString(),
          formatCurrency(selectedProduct?.sellingPrice || 0),
          formatCurrency(quantity * (selectedProduct?.sellingPrice || 0))
        ]
      ],
      styles: { fontSize: 7 },
      margin: { left: margin, right: margin }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text('TOTAL: ' + formatCurrency(quantity * (selectedProduct?.sellingPrice || 0)), 75, finalY, { align: 'right' });
    
    doc.setFontSize(7);
    doc.text('Obrigado pela preferência!', 40, finalY + 15, { align: 'center' });

    doc.save(`recibo_${id.slice(-6)}.pdf`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;
    if (selectedProduct && quantity > selectedProduct.currentStock) {
      setStatus({ type: 'error', message: 'Saldo de stock insuficiente!' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const movementId = Math.random().toString(36).substr(2, 9); // Real ID would come from server
      await stockService.registerMovement('OUT', selectedProductId, quantity, selectedProduct?.sellingPrice || 0, {
        partnerId: customerId,
        observation
      });
      
      setStatus({ type: 'success', message: 'Saída registrada com sucesso!' });
      
      // Auto-generate invoice
      generatePDF(movementId, {});

      // Reset form
      setSelectedProductId('');
      setQuantity(0);
      setCustomerId('');
      setObservation('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Erro ao registrar saída.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Registrar Saída / Venda</h1>
        <p className="text-slate-500">Retire stock do inventário para uma venda ou consumo.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isScannerOpen && (
            <BarcodeScanner 
              onScan={handleScan}
              onClose={() => setIsScannerOpen(false)}
            />
          )}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Produto</label>
                  <button 
                    type="button" 
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 bg-blue-50 rounded-md"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Ligar Scanner</span>
                  </button>
                </div>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 appearance-none"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">Seleccione um produto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.currentStock <= 0}>
                        {p.name} ({p.currentStock} em stock)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Quantidade</label>
                  <input 
                    required
                    type="number" min="1" max={selectedProduct?.currentStock}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Preço Venda (Un.)</label>
                  <div className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500">
                    {selectedProduct ? formatCurrency(selectedProduct.sellingPrice) : '€ 0,00'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Cliente</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                >
                  <option value="">Cliente Final / Ocasional</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Observações</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg min-h-[100px]"
                  placeholder="Referente à encomenda #X, venda balcão..."
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

            <div className="flex gap-4">
               <button 
                type="submit"
                disabled={submitting || !selectedProductId || (selectedProduct && quantity > selectedProduct.currentStock)}
                className="flex-1 py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? 'A registrar...' : (
                  <>
                    <Printer className="w-5 h-5" />
                    <span>Concluir Venda e Imprimir</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center underline decoration-rose-500">Talão de Venda</h3>
            {selectedProduct ? (
              <div className="space-y-4 font-mono text-sm">
                <div className="border-b border-dashed border-slate-200 pb-4 text-center">
                  <p className="font-bold uppercase tracking-widest text-slate-900">StockMaster POS</p>
                  <p className="text-[10px] text-slate-400">Rua da Tecnologia, 123</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{selectedProduct.name}</span>
                    <span>x{quantity}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-slate-500">
                    <span>Un: {formatCurrency(selectedProduct.sellingPrice)}</span>
                    <span>{formatCurrency(quantity * selectedProduct.sellingPrice)}</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between font-bold text-lg">
                  <span>TOTAL</span>
                  <span className="text-slate-900">{formatCurrency(quantity * selectedProduct.sellingPrice)}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-center pt-4">
                  <p>Conserve o seu talão.</p>
                  <p>{new Date().toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FileText className="w-10 h-10 opacity-20" />
                <p className="text-sm">Seleccione um produto para ver o talão.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
