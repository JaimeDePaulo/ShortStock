/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import MoveIn from './pages/MoveIn';
import MoveOut from './pages/MoveOut';
import History from './pages/History';
import Reports from './pages/Reports';
import Config from './pages/Configuracoes';
import Login from './pages/Login';
import Users from './pages/Users';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/produtos" element={
            <PrivateRoute>
              <Layout>
                <Products />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/entradas" element={
            <PrivateRoute>
              <Layout>
                <MoveIn />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/saidas" element={
            <PrivateRoute>
              <Layout>
                <MoveOut />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/movimentacoes" element={
            <PrivateRoute>
              <Layout>
                <History />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/relatorios" element={
            <PrivateRoute>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/utilizadores" element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/configuracoes" element={
            <PrivateRoute>
              <Layout>
                <Config />
              </Layout>
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
