import { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, Clock, Search, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { dbService } from '../services/db';
import { UserProfile, UserSession } from '../types';
import { formatDate } from '../lib/utils';
import { orderBy } from 'firebase/firestore';

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersList = await dbService.list('users') as UserProfile[];
        const sessionsList = await dbService.list('user_sessions', [orderBy('timestamp', 'desc')]) as UserSession[];
        setUsers(usersList);
        setSessions(sessionsList);
      } catch (error) {
        console.error('Error fetching users/sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-brand-text-main">Gestão de Utilizadores</h1>
        <p className="text-[13px] text-brand-text-muted">Veja quem tem acesso e as últimas entradas no sistema.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="panel h-full">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-blue-600" />
                <h3 className="panel-title">Utilizadores Registados</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-text-muted" />
                <input 
                  type="text" 
                  placeholder="Pesquisar utilizador..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-brand-border rounded-md text-[12px] focus:ring-1 focus:ring-blue-500 outline-none w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Perfil</th>
                    <th>Data Registo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="font-semibold text-slate-800">{user.name}</td>
                      <td className="text-slate-500">{user.email}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="text-slate-500">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 italic">Nenhum utilizador encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="panel-title">Últimas Entradas</h3>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {sessions.slice(0, 15).map(session => (
              <div key={session.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <LogIn className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-slate-800 truncate">{session.email}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(session.timestamp)}</p>
                </div>
              </div>
            ))}
            {sessions.length === 0 && !loading && (
              <p className="p-6 text-center text-[12px] text-slate-400 italic">Nenhum log de entrada registado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
