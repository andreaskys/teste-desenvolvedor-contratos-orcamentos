import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@modelo.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Growth SaaS
          </h1>
          <p className="text-gray-500 font-medium">Controle de Contratos e Obras</p>
        </div>

        <div className="apple-card shadow-2xl shadow-blue-500/10">
          <h2 className="text-xl font-bold mb-6 text-center">Entrar na sua conta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="apple-input w-full"
                placeholder="exemplo@empresa.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apple-input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="apple-button-primary w-full py-3 mt-4"
            >
              {loading ? 'Entrando...' : 'Acessar Sistema'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          &copy; 2026 Growth Tecnologia. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
