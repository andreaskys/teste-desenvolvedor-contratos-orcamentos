import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Contracts from './pages/Contracts';
import NewContract from './pages/NewContract';
import ContractDetails from './pages/ContractDetails';
import Templates from './pages/Templates';
import Obras from './pages/Obras';
import ObraDetails from './pages/ObraDetails';
import PublicSign from './pages/PublicSign';
import ActiveContracts from './pages/ActiveContracts';
import ContractManager from './pages/ContractManager';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sign/:id" element={<PublicSign />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="manager" element={<ContractManager />} />
          <Route path="vigentes" element={<ActiveContracts />} />
          <Route path="contracts/new" element={<NewContract />} />
          <Route path="contracts/:id" element={<ContractDetails />} />
          <Route path="templates" element={<Templates />} />
          <Route path="obras" element={<Obras />} />
          <Route path="obras/:id" element={<ObraDetails />} />
          <Route path="settings" element={<div>Configurações em breve...</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
