import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewContract from './pages/NewContract';
import ContractDetails from './pages/ContractDetails';
import Templates from './pages/Templates';
import Obras from './pages/Obras';
import ObraDetails from './pages/ObraDetails';
import PublicSign from './pages/PublicSign';
import SignaturesQueue from './pages/SignaturesQueue';
import ContractManager from './pages/ContractManager';
import PurchaseOrders from './pages/PurchaseOrders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sign/:id" element={<PublicSign />} />
        <Route path="/" element={<Layout />}>
          {/* Contratos & Assinaturas */}
          <Route index element={<Dashboard />} />
          <Route path="contracts" element={<ContractManager />} />
          <Route path="templates" element={<Templates />} />
          <Route path="contracts/new" element={<NewContract />} />
          <Route path="assinaturas" element={<SignaturesQueue />} />
          <Route path="manager" element={<ContractManager />} />
          <Route path="contracts/:id" element={<ContractDetails />} />

          {/* Obras & Configurações */}
          <Route path="obras" element={<Obras />} />
          <Route path="obras/:id" element={<ObraDetails />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
