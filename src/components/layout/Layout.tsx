import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { Search, Menu } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-brand-bg font-sans relative">
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'pl-[220px]' : 'pl-0'}`}>
        <header className="h-[60px] bg-white border-b border-brand-border flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
              title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-[300px] hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input 
                type="text" 
                placeholder="Pesquisar produtos, referências..." 
                className="w-full bg-slate-100 border-none rounded-md py-2 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
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
