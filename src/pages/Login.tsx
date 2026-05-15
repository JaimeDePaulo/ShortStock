import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, ShieldCheck, User as UserIcon, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  googleProvider, 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { cn } from '../lib/utils';

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      console.log("Login: Utilizador já autenticado, redirecionando para dashboard...");
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);
    console.log(`Login: Tentando ${isRegistering ? 'registo' : 'login'} para ${email}...`);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Login: Conta criada com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Login: Autenticação efetuada!");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      let message = 'Ocorreu um erro na autenticação.';
      
      if (err.code === 'auth/email-already-in-use') message = 'Este email já está a ser utilizado.';
      if (err.code === 'auth/invalid-credential') message = 'Email ou palavra-passe incorretos.';
      if (err.code === 'auth/weak-password') message = 'A palavra-passe deve ter pelo menos 6 caracteres.';
      if (err.code === 'auth/user-not-found') message = 'Utilizador não encontrado.';
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    console.log("Login: Tentando autenticação por Google...");
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("Login: Google Auth Sucesso!");
    } catch (err: any) {
      setError('Erro ao fazer login com Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'operator') => {
    alert(`Modo Demo: Para testar como ${role}, aceda via Email/Google. O sistema gerará o perfil automaticamente.`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[400px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8 bg-blue-600 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">ShortStock</h1>
          </div>
          
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <LogIn className="w-24 h-24 rotate-12" />
          </div>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Endereço de Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="exemplo@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Palavra-passe</label>
                {!isRegistering && (
                  <button type="button" className="text-[10px] font-bold text-blue-600 hover:underline">Esqueceu a senha?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'A processar...' : (isRegistering ? 'Criar Conta' : 'Entrar no Sistema')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full py-2 text-center text-[12px] text-slate-500 font-semibold hover:text-blue-600 transition-colors"
            >
              {isRegistering ? 'Já tem conta? Faça Login' : 'Não tem conta? Registe-se agora'}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou aceder via</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-[13px] hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Google Workspace
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center text-rose-600 text-[12px] font-bold bg-rose-50 p-2 rounded-lg border border-rose-100"
            >
              {error}
            </motion.div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Desenvolvido por Jaime de Paulo</p>
        </div>
      </motion.div>
    </div>
  );
}
