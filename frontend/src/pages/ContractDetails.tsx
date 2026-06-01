import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Send, CheckCircle, Clock, Mail, 
  MessageSquare, ArrowLeft, Download, Copy, 
  ExternalLink, X, Info 
} from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const ContractDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'audit'>('content');
  const [signData, setSignData] = useState({ email: '', phone: '', channel: 'BOTH' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.get(`/contracts/${id}`).then((res) => {
      setContract(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleSendSignature = async () => {
    setActionLoading(true);
    try {
      await api.post('/signatures', {
        contractId: id,
        ...signData,
      });
      setShowSignModal(false);
      const res = await api.get(`/contracts/${id}`);
      setContract(res.data);
      toast.success('Solicitação de assinatura enviada!');
    } catch (err) {
      toast.error('Erro ao enviar solicitação.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    if (!contract?.template) return "Conteúdo do contrato...";
    
    let content = contract.template.content;
    const filledFields = contract.filledFields || {};

    // Replace placeholders {{key}} with actual values
    Object.keys(filledFields).forEach(key => {
      const value = filledFields[key];
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value || `[${key}]`);
    });

    return content;
  };

  const handleSignSimulated = async () => {
    if (contract.signatureRequest) {
      window.open(`/sign/${contract.signatureRequest.id}`, '_blank');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/contracts/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${contract.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download PDF', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado!');
  };

  if (loading) return <div className="p-8 text-center font-medium text-gray-500">Carregando detalhes...</div>;
  if (!contract) return <div className="p-8 text-center text-red-500 font-bold">Contrato não encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/contracts')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
          <ArrowLeft size={20} />
          Voltar para listagem
        </button>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={handleDownloadPDF}
            leftIcon={<Download size={18} />}
          >
            Baixar PDF
          </Button>
          {contract.status === 'DRAFT' && (
            <Button 
              onClick={() => setShowSignModal(true)}
              leftIcon={<Send size={18} />}
            >
              Enviar para Assinatura
            </Button>
          )}
          {contract.status === 'PENDING_SIGNATURE' && (
            <Button 
              onClick={handleSignSimulated}
              variant="success"
              leftIcon={<ExternalLink size={18} />}
            >
              Assinar Documento
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="apple-card p-0 overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50/50 px-4">
              <button 
                onClick={() => setActiveTab('content')}
                className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'content' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400'}`}
              >
                Conteúdo do Documento
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'audit' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400'}`}
              >
                Histórico de Auditoria
              </button>
            </div>

            {activeTab === 'content' ? (
              <div className="p-8">
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                    {(contract.status === 'ACTIVE' || contract.status === 'SIGNED') && (
                      <span className="apple-badge bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20 shadow-none">ASSINADO</span>
                    )}
                    {contract.status === 'DRAFT' && (
                      <span className="apple-badge bg-gray-100 text-gray-500 border-gray-200 shadow-none">RASCUNHO</span>
                    )}
                    {contract.status === 'PENDING_SIGNATURE' && (
                      <span className="apple-badge bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20 shadow-none">AGUARDANDO ASSINATURA</span>
                    )}
                    {contract.status === 'EXPIRED' && (
                      <span className="apple-badge bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20 shadow-none">EXPIRADO</span>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 min-h-[500px] bg-white p-10 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] whitespace-pre-wrap">
                  {renderContent()}
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="space-y-8">
                  {contract.auditLogs?.map((log: any, idx: number) => (
                    <div key={log.id} className="relative pl-8 pb-8 last:pb-0">
                      {idx !== contract.auditLogs.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-100" />
                      )}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{log.action}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">Ação realizada no recurso {log.resource}</p>
                        {log.payload && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {Object.entries(log.payload).map(([key, value]: [string, any]) => (
                              <div key={key} className="text-[10px]">
                                <span className="text-gray-400 uppercase font-bold">{key}:</span>
                                <span className="ml-1 text-gray-600 truncate inline-block max-w-full align-bottom">{JSON.stringify(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!contract.auditLogs || contract.auditLogs.length === 0) && (
                    <div className="text-center py-12 text-gray-400 italic text-sm">
                      Nenhum registro de auditoria encontrado.
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={14} /> Link enviado via E-mail
                    </div>
                    <button 
                      onClick={() => copyToClipboard(contract.signatureRequest.link)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors"
                      title="Copiar Link"
                    >
                      <Copy size={14} />
                    </button>
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
              <Button variant="ghost" className="flex-1" onClick={() => setShowSignModal(false)}>Cancelar</Button>
              <Button className="flex-1" isLoading={actionLoading} onClick={handleSendSignature}>Enviar Agora</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetails;
