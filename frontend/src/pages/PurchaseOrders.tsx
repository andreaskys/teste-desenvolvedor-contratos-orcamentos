import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Plus, Filter, HardHat, FileText, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch purchase orders', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#0071E3] font-bold text-xs uppercase tracking-[0.2em]">
            <ShoppingCart size={14} />
            <span>Módulo de Suprimentos</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Ordens de Compra</h1>
          <p className="text-gray-500 mt-2 max-w-xl">Emissão, controle e acompanhamento de requisições de material para as obras.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Filter size={18} />}>
            Filtros
          </Button>
          <Button 
            onClick={() => navigate('/obras')}
            leftIcon={<Plus size={18} />}
          >
            Nova O.C. (Via Obra)
          </Button>
        </div>
      </div>

      <div className="apple-card p-0 overflow-hidden bg-white shadow-sm border-none">
        <div className="p-6 border-b border-gray-100/50 bg-gray-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por fornecedor, número..."
              className="apple-input w-full pl-12 bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="py-4 px-6">Documento</th>
                <th className="py-4 px-6">Projeto Vinculado</th>
                <th className="py-4 px-6">Fornecedor</th>
                <th className="py-4 px-6">Emissão</th>
                <th className="py-4 px-6">Valor Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">Carregando ordens de compra...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">Nenhuma Ordem de Compra emitida no sistema.</td>
                </tr>
              ) : (
                orders.map((po, idx) => (
                  <tr key={idx} className="hover:bg-[#0071E3]/5 transition-colors cursor-pointer group" onClick={() => navigate(`/obras/${po.obraId}`)}>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      O.C. #{po.number}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900 text-sm">{po.obra.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">CT {po.obra.contract.number}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                      {po.vendor}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(po.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                        po.status === 'APPROVED' ? 'bg-[#34C759]/10 text-[#34C759]' : 
                        po.status === 'PENDING' ? 'bg-[#FF9500]/10 text-[#FF9500]' : 
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {po.status === 'APPROVED' ? 'Aprovada' : po.status === 'PENDING' ? 'Pendente' : po.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-[#0071E3] opacity-0 group-hover:opacity-100 transition-all font-bold text-sm flex items-center gap-1 ml-auto">
                        Ver na Obra <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
