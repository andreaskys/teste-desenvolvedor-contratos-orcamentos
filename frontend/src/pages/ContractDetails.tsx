import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Send, CheckCircle, Clock, Mail, MessageSquare, ArrowLeft, Eye, Download } from 'lucide-react';
import api from '../api/client';

const ContractDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signData, setSignData] = useState({ email: '', phone: '', channel: 'BOTH' });

  useEffect(() => {
    api.get(`/contracts/${id}`).then((res) => {
      setContract(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleSendSignature = async () => {
    try {
      await api.post('/signatures', {
        contractId: id,
        ...signData,
      });
      setShowSignModal(false);
      // Reload contract
      const res = await api.get(`/contracts/${id}`);
      setContract(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignSimulated = async () => {
    try {
      if (contract.signatureRequest) {
        await api.post(`/signatures/${contract.signatureRequest.id}/sign`);
        const res = await api.get(`/contracts/${id}`);
        setContract(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!contract) return <div className="p-8 text-center">Contrato não encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/contracts')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
          Voltar para listagem
        </button>
        <div className="flex gap-3">
          <button className="apple-button-secondary flex items-center gap-2">
            <Download size={18} /> Exportar PDF
          </button>
          {contract.status === 'DRAFT' && (
            <button 
              onClick={() => setShowSignModal(true)}
              className="apple-button-primary flex items-center gap-2"
            >
              <Send size={18} /> Enviar para Assinatura
            </button>
          )}
          {contract.status === 'PENDING_SIGNATURE' && (
            <button 
              onClick={handleSignSimulated}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <CheckCircle size={18} /> Simular Assinatura (QA)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="apple-card">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                  <FileText size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
                  <p className="text-gray-500">{contract.number}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                {contract.status === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg font-bold text-sm">ATIVO</span>
                )}
                {contract.status === 'DRAFT' && (
                  <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg font-bold text-sm">RASCUNHO</span>
                )}
                {contract.status === 'PENDING_SIGNATURE' && (
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg font-bold text-sm">AGUARDANDO ASSINATURA</span>
                )}
              </div>
            </div>

            <div className="prose prose-blue max-w-none text-gray-700 min-h-[400px] bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-200">
              {contract.template?.content || "Conteúdo do contrato..."}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="apple-card">
            <h3 className="text-lg font-bold mb-6">Informações Gerais</h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Valor Total</span>
                <span className="font-bold text-gray-900">R$ {parseFloat(contract.value).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Data de Início</span>
                <span className="font-medium text-gray-900">{new Date(contract.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Data de Término</span>
                <span className="font-medium text-gray-900">{new Date(contract.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Vigência Restante</span>
                <span className="font-bold text-blue-600">
                  {Math.max(0, Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} dias
                </span>
              </div>
            </div>
          </div>

          {contract.signatureRequest && (
            <div className="apple-card">
              <h3 className="text-lg font-bold mb-6">Fluxo de Assinatura</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${contract.signatureRequest.status === 'SIGNED' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {contract.signatureRequest.status === 'SIGNED' ? 'Assinado' : 'Aguardando Assinatura'}
                    </p>
                    <p className="text-xs text-gray-500">{contract.signatureRequest.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={14} /> Link enviado via E-mail
                  </div>
                  {contract.signatureRequest.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MessageSquare size={14} /> Link enviado via WhatsApp
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logs de Atividade</p>
                  <div className="space-y-2">
                    <div className="flex gap-3 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
                      <div>
                        <p className="text-gray-900 font-medium">Link de assinatura gerado</p>
                        <p className="text-gray-400">{new Date(contract.signatureRequest.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {contract.signatureRequest.status === 'SIGNED' && (
                      <div className="flex gap-3 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1" />
                        <div>
                          <p className="text-gray-900 font-medium">Assinado eletronicamente</p>
                          <p className="text-gray-400">{new Date(contract.signatureRequest.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Assinatura */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Enviar para Assinatura</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">E-mail do Signatário</label>
                <input 
                  type="email" 
                  value={signData.email}
                  onChange={(e) => setSignData({ ...signData, email: e.target.value })}
                  placeholder="exemplo@email.com"
                  className="apple-input w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">WhatsApp (Opcional)</label>
                <input 
                  type="tel" 
                  value={signData.phone}
                  onChange={(e) => setSignData({ ...signData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="apple-input w-full"
                />
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium text-gray-700">Canal de Envio</p>
                <div className="grid grid-cols-3 gap-2">
                  {['EMAIL', 'WHATSAPP', 'BOTH'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setSignData({ ...signData, channel: c })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        signData.channel === c ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {c === 'BOTH' ? 'Ambos' : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowSignModal(false)} className="apple-button-secondary flex-1">Cancelar</button>
              <button onClick={handleSendSignature} className="apple-button-primary flex-1">Enviar Agora</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetails;
