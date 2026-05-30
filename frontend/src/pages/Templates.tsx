import React, { useState, useEffect } from 'react';
import { Plus, FileText, Trash2, Edit3, Save, X } from 'lucide-react';
import api from '../api/client';

interface TemplateField {
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

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    fields: [] as TemplateField[],
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setNewTemplate({
      ...newTemplate,
      fields: [...newTemplate.fields, { label: '', key: '', type: 'text', required: true }],
    });
  };

  const handleFieldChange = (index: number, key: keyof TemplateField, value: any) => {
    const fields = [...newTemplate.fields];
    fields[index] = { ...fields[index], [key]: value };
    setNewTemplate({ ...newTemplate, fields });
  };

  const handleSave = async () => {
    try {
      await api.post('/templates', newTemplate);
      setShowCreateModal(false);
      setNewTemplate({ name: '', content: '', fields: [] });
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Templates</h1>
          <p className="text-gray-500">Gerencie os modelos de contrato da sua empresa</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="apple-button-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Carregando templates...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-full apple-card py-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-200" />
            <p>Nenhum template cadastrado ainda.</p>
            <button onClick={() => setShowCreateModal(true)} className="text-blue-500 font-bold mt-2">Clique aqui para criar o primeiro</button>
          </div>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="apple-card hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                  <FileText size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-blue-500"><Edit3 size={18} /></button>
                  <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{t.content}</p>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">{t.fields.length} campos dinâmicos</span>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Pronto para uso</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="apple-card w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Criar Novo Template</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome do Template</label>
                <input 
                  type="text" 
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Ex: Contrato de Prestação de Serviço"
                  className="apple-input w-full"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Conteúdo do Contrato</label>
                <textarea 
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Use {{campo}} para partes dinâmicas..."
                  className="apple-input w-full min-h-[150px]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Definição de Campos</h3>
                  <button onClick={handleAddField} className="text-blue-500 text-xs font-bold flex items-center gap-1">
                    <Plus size={14} /> Adicionar Campo
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newTemplate.fields.map((field, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl relative">
                      <input 
                        type="text" 
                        placeholder="Label (ex: Data)"
                        value={field.label}
                        onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                        className="apple-input text-xs"
                      />
                      <input 
                        type="text" 
                        placeholder="Key (ex: data_obra)"
                        value={field.key}
                        onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                        className="apple-input text-xs"
                      />
                      <select 
                        value={field.type}
                        onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                        className="apple-input text-xs"
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="date">Data</option>
                      </select>
                      <button 
                        onClick={() => {
                          const fields = newTemplate.fields.filter((_, i) => i !== idx);
                          setNewTemplate({ ...newTemplate, fields });
                        }}
                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreateModal(false)} className="apple-button-secondary flex-1">Cancelar</button>
              <button onClick={handleSave} className="apple-button-primary flex-1 flex items-center justify-center gap-2">
                <Save size={18} /> Salvar Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
