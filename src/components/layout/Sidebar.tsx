import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History as HistoryIcon, 
  FileText, 
  Settings, 
  LogOut,
  Users,
  PieChart,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import {signOut, auth} from '../../lib/firebase';
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const menuItems = [
    {name: 'Dashboard', icon: LayoutDashboard, path: '/'},
    {name: 'Produtos', icon: Package, path: '/produtos'},
    {name: 'Entradas', icon: ArrowDownLeft, path: '/entradas'},
    {name: 'Saídas', icon: ArrowUpRight, path: '/saidas'},
    {name: 'Facturas', icon: FileText, path: '/facturas'},
    {name: 'Relatórios', icon: PieChart, path: '/relatorios'},
    {name: 'Configurações', icon: Settings, path: '/configuracoes'},
  ];

  return (
    <aside className={cn(
      "bg-brand-sidebar text-white h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300 overflow-hidden",
      isOpen ? "w-[220px]" : "w-0"
    )}>
      <div className="px-6 py-8 flex items-center gap-3 shrink-0">
        <span className="text-xl font-black text-blue-500 tracking-tighter uppercase whitespace-nowrap">ShortStock</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-6 py-3 text-[13px] transition-all border-l-4",
              isActive 
                ? "bg-white/5 text-white border-blue-600" 
                : "text-slate-400 border-transparent hover:bg-white/2 hover:text-slate-200 shadow-none"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-4">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Base de Dados</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            Firebase Conectado
          </div>
        </div>
      </div>
    </aside>
  );
}
