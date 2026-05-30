import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import api from '../api/client';

interface TemplateField {
  id: string;
  label: string;
  key: string;
  type: string;
  required: boolean;
}

interface Template {
  id: string;
  name: string;
  content: string;
  fields: TemplateField[];
}

const NewContract: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [contractData, setContractData] = useState({
    number: `CNT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: '',
    value: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    api.get('/templates').then((res) => setTemplates(res.data));
  }, []);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleContractSubmit = async () => {
    try {
      // Logic to merge template content with formData could go here if needed server-side
      await api.post('/contracts', {
        ...contractData,
        value: parseFloat(contractData.value),
        templateId: selectedTemplate?.id,
        status: 'DRAFT',
      });
      navigate('/contracts');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-12">
        {[
          { s: 1, l: 'Escolher Template' },
          { s: 2, l: 'Dados do Contrato' },
          { s: 3, l: 'Campos Dinâmicos' },
          { s: 4, l: 'Revisão' },
        ].map((item) => (
          <React.Fragment key={item.s}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= item.s ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step > item.s ? <CheckCircle2 size={20} /> : item.s}
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= item.s ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.l}
              </span>
            </div>
            {item.s < 4 && (
              <div className={`w-20 h-0.5 mx-4 transition-all duration-500 ${step > item.s ? 'bg-blue-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="apple-card shadow-xl shadow-blue-500/5">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Escolha um Template</h2>
              <p className="text-gray-500">Selecione o tipo de contrato que deseja criar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <FileText size={40} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">Você ainda não tem templates cadastrados.</p>
                  <button 
                    onClick={() => navigate('/templates')}
                    className="apple-button-secondary inline-flex items-center gap-2"
                  >
                    <Plus size={18} /> Criar Primeiro Template
                  </button>
                </div>
              ) : (
                templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className="flex items-center gap-4 p-6 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100 rounded-2xl transition-all text-left group"
                  >
                    <div className="p-3 bg-white rounded-xl text-blue-500 shadow-sm">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">Clique para selecionar</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dados do Contrato</h2>
              <p className="text-gray-500">Informações básicas para identificação.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Número</label>
                <input
                  type="text"
                  value={contractData.number}
                  readOnly
                  className="apple-input w-full bg-gray-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Título / Objeto</label>
                <input
                  type="text"
                  placeholder="Ex: Prestação de Serviço de TI"
                  value={contractData.title}
                  onChange={(e) => setContractData({ ...contractData, title: e.target.value })}
                  className="apple-input w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Valor do Contrato</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={contractData.value}
                  onChange={(e) => setContractData({ ...contractData, value: e.target.value })}
                  className="apple-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">Início</label>
                  <input
                    type="date"
                    value={contractData.startDate}
                    onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                    className="apple-input w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">Fim</label>
                  <input
                    type="date"
                    value={contractData.endDate}
                    onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                    className="apple-input w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="apple-button-secondary">Voltar</button>
              <button onClick={() => setStep(3)} className="apple-button-primary px-8">Próximo</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Campos Dinâmicos</h2>
              <p className="text-gray-500">Preencha os dados específicos do template.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedTemplate?.fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">{field.label}</label>
                  <input
                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="apple-input w-full"
                    required={field.required}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="apple-button-secondary">Voltar</button>
              <button onClick={() => setStep(4)} className="apple-button-primary px-8">Revisar</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Revisão Final</h2>
                <p className="text-gray-500">Confira as informações antes de salvar.</p>
              </div>
              <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
                <Info size={16} />
                Status: Rascunho
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Informações Base</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Número:</span> <span className="font-medium">{contractData.number}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Título:</span> <span className="font-medium">{contractData.title}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Valor:</span> <span className="font-medium">R$ {parseFloat(contractData.value).toLocaleString('pt-BR')}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Vigência:</span> <span className="font-medium">{new Date(contractData.startDate).toLocaleDateString()} - {new Date(contractData.endDate).toLocaleDateString()}</span></p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Campos do Template</h3>
                <div className="space-y-2">
                  {selectedTemplate?.fields.map(f => (
                    <p key={f.id} className="text-sm">
                      <span className="text-gray-500">{f.label}:</span> <span className="font-medium">{formData[f.key] || '-'}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm text-gray-600">
              "{selectedTemplate?.content.replace(/{{(.*?)}}/g, (match, key) => formData[key] || match)}"
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(3)} className="apple-button-secondary">Voltar</button>
              <button onClick={handleContractSubmit} className="apple-button-primary px-8">Salvar Contrato</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewContract;
