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
import { signOut, auth } from '../../lib/firebase';
import { useAuth } from '../../components/AuthProvider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Produtos', icon: Package, path: '/produtos' },
    { name: 'Entradas', icon: ArrowDownLeft, path: '/entradas' },
    { name: 'Saídas', icon: ArrowUpRight, path: '/saidas' },
    { name: 'Facturas', icon: FileText, path: '/facturas' },
    { name: 'Relatórios', icon: PieChart, path: '/relatorios' },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Utilizadores', icon: Users, path: '/utilizadores' });
    menuItems.push({ name: 'Configurações', icon: Settings, path: '/configuracoes' });
  }

  const handleSignOut = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      await signOut(auth);
    }
  };

  return (
    <aside className="w-[220px] bg-brand-sidebar text-white h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="px-6 py-8 flex items-center gap-3">
        <span className="text-xl font-black text-blue-500 tracking-tighter uppercase">ShortStock</span>
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
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-slate-400 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sair da Sessão</span>
        </button>

        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">ShortStock ERP</p>
          <p className="text-[9px] text-slate-500 mt-1">Desenvolvido por Jaime de Paulo</p>
        </div>
      </div>
    </aside>
  );
}
