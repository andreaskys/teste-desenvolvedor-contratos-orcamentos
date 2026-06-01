import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Mail, Phone, ExternalLink } from 'lucide-react';
import api from '../api/client';
import Button from '../components/Button';
import toast from 'react-hot-toast';

interface SignatureRequest {
  id: string;
  email: string;
  phone: string;
  channel: string;
  status: string;
  link: string;
  createdAt: string;
  contract: {
    number: string;
    title: string;
  }
}

const SignaturesQueue: React.FC = () => {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/signatures');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch signatures', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResend = async (id: string) => {
    // Logic for resending (simulated here)
    toast.success('Link reenviado com sucesso!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Fila de Assinaturas</h1>
          <p className="text-gray-500 mt-1 font-medium">Acompanhe e gerencie o status das solicitações enviadas.</p>
        </div>
        <Button variant="secondary" onClick={fetchRequests} leftIcon={<RefreshCw size={18} />}>
          Atualizar Fila
        </Button>
      </div>

      <div className="apple-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/80 border-b border-gray-100">
                <th className="p-6">Contrato</th>
                <th className="p-6">Destinatário</th>
                <th className="p-6">Canal</th>
                <th className="p-6">Status</th>
                <th className="p-6">Data Envio</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">Carregando fila...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">Nenhuma solicitação na fila.</td>
                </tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{req.contract.number}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">{req.contract.title}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                        {req.channel === 'EMAIL' ? <Mail size={16} /> : <Phone size={16} />}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{req.channel === 'EMAIL' ? req.email : req.phone}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      req.channel === 'EMAIL' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {req.channel}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {req.status === 'SIGNED' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : req.status === 'EXPIRED' ? (
                        <AlertCircle size={16} className="text-red-500" />
                      ) : (
                        <Clock size={16} className="text-orange-500 animate-pulse" />
                      )}
                      <span className={`text-sm font-bold ${
                        req.status === 'SIGNED' ? 'text-green-600' : 
                        req.status === 'EXPIRED' ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {req.status === 'SIGNED' ? 'Assinado' : req.status === 'EXPIRED' ? 'Expirado' : 'Aguardando'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm text-gray-500 font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(req.link, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-500"
                        title="Abrir Link"
                      >
                        <ExternalLink size={18} />
                      </Button>
                      {req.status !== 'SIGNED' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleResend(req.id)}
                          className="p-2 text-gray-400 hover:text-[#0071E3]"
                          title="Reenviar"
                        >
                          <Send size={18} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SignaturesQueue;
