import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Contracts from './pages/Contracts';
import NewContract from './pages/NewContract';
import ContractDetails from './pages/ContractDetails';
import Obras from './pages/Obras';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="contracts/new" element={<NewContract />} />
          <Route path="contracts/:id" element={<ContractDetails />} />
          <Route path="obras" element={<Obras />} />
          <Route path="settings" element={<div>Configurações em breve...</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
