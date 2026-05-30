import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';

const Layout: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-gray-500 font-medium">Bem-vindo de volta,</h2>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{user?.company.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
