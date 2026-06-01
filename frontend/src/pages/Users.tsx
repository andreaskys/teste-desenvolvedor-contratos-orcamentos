import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Plus, Search, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../api/client';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'OPERATOR',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users', formData);
      await fetchUsers();
      setModalOpen(false);
      setFormData({ name: '', email: '', role: 'OPERATOR', password: '' });
      toast.success('Usuário criado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#0071E3] font-bold text-xs uppercase tracking-[0.2em]">
            <UsersIcon size={14} />
            <span>Multi-Tenant</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-gray-500 mt-2 max-w-xl">Controle de acessos, papéis e permissões vinculados estritamente ao escopo da sua empresa.</p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          leftIcon={<Plus size={18} />}
        >
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-medium">Carregando usuários...</div>
        ) : (
          users.map((user, idx) => (
            <div key={idx} className="apple-card hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xl font-black text-gray-500 shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                  user.role === 'MANAGER' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.role}
                </span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 tracking-tight">{user.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm font-medium">
                <Mail size={16} />
                {user.email}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ativo</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-400 hover:text-red-500 transition-colors px-2 py-2"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Novo Usuário</h3>
              <p className="text-sm text-gray-500 mt-1">Conceda acesso a um novo membro da equipe.</p>
            </div>
            <form id="user-form" onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome Completo</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="apple-input w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">E-mail Corporativo</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="apple-input w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nível de Acesso (Role)</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="apple-input w-full"
                >
                  <option value="OPERATOR">Operador (Acesso Padrão)</option>
                  <option value="MANAGER">Gerente (Aprovações e Visão Global)</option>
                  <option value="ADMIN">Administrador (Acesso Total)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Senha Temporária</label>
                <input 
                  type="password" required
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="apple-input w-full"
                />
              </div>
            </form>
            <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-3">
              <Button 
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                form="user-form" 
                isLoading={submitting}
              >
                Adicionar Usuário
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
