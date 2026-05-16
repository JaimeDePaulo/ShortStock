/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import MoveIn from './pages/MoveIn';
import MoveOut from './pages/MoveOut';
import History from './pages/History';
import Reports from './pages/Reports';
import Config from './pages/Configuracoes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        
        <Route path="/produtos" element={
          <Layout>
            <Products />
          </Layout>
        } />

        <Route path="/entradas" element={
          <Layout>
            <MoveIn />
          </Layout>
        } />

        <Route path="/saidas" element={
          <Layout>
            <MoveOut />
          </Layout>
        } />

        <Route path="/movimentacoes" element={
          <Layout>
            <History />
          </Layout>
        } />

        <Route path="/relatorios" element={
          <Layout>
            <Reports />
          </Layout>
        } />

        <Route path="/configuracoes" element={
          <Layout>
            <Config />
          </Layout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
