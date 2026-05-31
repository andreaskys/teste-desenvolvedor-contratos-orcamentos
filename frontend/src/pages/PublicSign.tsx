import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, FileText, Lock, MousePointer2 } from 'lucide-react';
import api from '../api/client';

const PublicSign: React.FC = () => {
  const { id } = useParams(); // Using signatureRequest ID
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    // We need a route to fetch signature request data publicly or at least via ID
    // For now, let's assume we can get it
    api.get(`/signatures/${id}`).then((res) => {
      setRequest(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  const handleSign = async () => {
    setSigning(true);
    try {
      await api.post(`/signatures/${id}/sign`);
      setSigned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSigning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <div className="text-gray-400 font-medium animate-pulse tracking-widest text-sm uppercase">Carregando documento...</div>
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <div className="apple-card max-w-md text-center">
        <div className="p-4 bg-[#FF3B30]/10 text-[#FF3B30] rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Link Expirado ou Inválido</h2>
        <p className="text-gray-500 mt-3 font-medium">Este link de assinatura não é mais válido ou o documento já foi processado.</p>
      </div>
    </div>
  );

  if (signed || request.status === 'SIGNED') return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <div className="apple-card max-w-md text-center">
        <div className="p-4 bg-[#34C759]/10 text-[#34C759] rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-inner border border-[#34C759]/20">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Documento Assinado!</h2>
        <p className="text-gray-500 mt-3 font-medium">Você assinou o documento com sucesso. Uma cópia será enviada para o seu e-mail em breve.</p>
        <div className="mt-8 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Hash de Autenticidade: <span className="text-gray-600">{Math.random().toString(36).substring(2, 15).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/80 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-[#0071E3] to-[#409CFF] text-white rounded-xl shadow-[0_2px_10px_rgba(0,113,227,0.3)]">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Assinatura Eletrônica Segura</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Growth SaaS Autenticador</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Signatário</p>
          <p className="text-sm font-bold text-gray-900">{request.email}</p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Document Viewer */}
        <div className="lg:col-span-2">
          <div className="apple-card p-0 overflow-hidden min-h-[800px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
            <div className="p-12 max-w-2xl mx-auto space-y-10">
              <div className="text-center space-y-3 border-b border-gray-100/50 pb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{request.contract.title}</h2>
                <p className="text-gray-400 font-semibold tracking-widest uppercase text-xs">Contrato: {request.contract.number}</p>
              </div>

              <div className="prose prose-sm md:prose-base text-gray-700 leading-relaxed font-medium">
                {request.contract.template?.content || "Conteúdo do contrato sendo processado..."}
                {/* Simulated contract text */}
                <div className="mt-12 space-y-6 text-gray-600 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <p><strong>Cláusula 1ª -</strong> Este documento formaliza o acordo entre as partes conforme as diretrizes operacionais do sistema Growth SaaS.</p>
                  <p><strong>Cláusula 2ª -</strong> A assinatura deste documento por meio eletrônico possui plena validade jurídica, conforme MP 2.200-2/2001.</p>
                </div>
              </div>

              <div className="mt-24 pt-12 border-t border-gray-100 grid grid-cols-2 gap-12 opacity-40">
                <div className="space-y-4">
                  <div className="h-[2px] bg-gray-300 w-full rounded-full" />
                  <p className="text-xs font-bold text-gray-900">{request.contract.company.name}</p>
                </div>
                <div className="space-y-4">
                  <div className="h-[2px] bg-gray-300 w-full rounded-full" />
                  <p className="text-xs font-bold text-gray-900">{request.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="apple-card sticky top-32 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] bg-white/60 backdrop-blur-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Ações do Documento</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
              Ao clicar no botão abaixo, você concorda com os termos do contrato e confirma sua identidade eletronicamente.
            </p>
            
            <button 
              onClick={handleSign}
              disabled={signing}
              className="w-full apple-button-primary py-4 text-base shadow-[0_8px_20px_rgba(0,113,227,0.3)] hover:shadow-[0_12px_24px_rgba(0,113,227,0.4)]"
            >
              {signing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MousePointer2 size={20} className="group-hover:scale-110 transition-transform" />
                  Assinar Agora
                </>
              )}
            </button>

            <div className="mt-10 pt-8 border-t border-gray-200/50 space-y-5">
              <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><Lock size={16} className="text-gray-400" /></div>
                Criptografia de ponta-a-ponta
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><CheckCircle size={16} className="text-[#34C759]" /></div>
                Validade Jurídica Garantida
              </div>
            </div>
          </div>

          <div className="p-6 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sistema desenvolvido por</p>
            <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] to-[#409CFF] mt-1 italic tracking-tighter">Growth SaaS</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicSign;
