import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-brand-bg font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[60px] bg-white border-b border-brand-border flex items-center justify-between px-6 shrink-0">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input 
              type="text" 
              placeholder="Pesquisar produtos, referências..." 
              className="w-full bg-slate-100 border-none rounded-md py-2 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <div className="flex flex-col items-end">
              <span className="text-brand-text-main font-semibold">Status: <strong className="text-blue-600">Sistema Aberto</strong></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-full mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
