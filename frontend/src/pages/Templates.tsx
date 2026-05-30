import React, { useState, useEffect } from 'react';
import { Plus, FileText, Trash2, Edit3, Save, X, Eye } from 'lucide-react';
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
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalModal] = useState<'create' | 'edit' | 'view'>('create');
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const [formTemplate, setFormTemplate] = useState({
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

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', template?: Template) => {
    setError('');
    setModalModal(mode);
    if (template) {
      setSelectedTemplate(template);
      setFormTemplate({
        name: template.name,
        content: template.content,
        fields: template.fields,
      });
    } else {
      setSelectedTemplate(null);
      setFormTemplate({ name: '', content: '', fields: [] });
    }
    setShowModal(true);
  };

  const handleAddField = () => {
    setFormTemplate({
      ...formTemplate,
      fields: [...formTemplate.fields, { label: '', key: '', type: 'text', required: true }],
    });
  };

  const handleFieldChange = (index: number, key: keyof TemplateField, value: any) => {
    const fields = [...formTemplate.fields];
    fields[index] = { ...fields[index], [key]: value };
    setFormTemplate({ ...formTemplate, fields });
  };

  const handleSave = async () => {
    if (!formTemplate.name || !formTemplate.content) {
      setError('Por favor, preencha o nome e o conteúdo do template.');
      return;
    }

    if (formTemplate.fields.some(f => !f.label || !f.key)) {
      setError('Por favor, preencha todos os campos da definição de campos.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (modalMode === 'create') {
        await api.post('/templates', formTemplate);
      } else {
        await api.put(`/templates/${selectedTemplate?.id}`, formTemplate);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao salvar o template. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) return;
    try {
      await api.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir template.');
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
          onClick={() => handleOpenModal('create')}
          className="apple-button-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && templates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">Carregando templates...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-full apple-card py-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-200" />
            <p>Nenhum template cadastrado ainda.</p>
            <button onClick={() => handleOpenModal('create')} className="text-blue-500 font-bold mt-2">Clique aqui para criar o primeiro</button>
          </div>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="apple-card hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                  <FileText size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal('view', t)}
                    className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleOpenModal('edit', t)}
                    className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-lg"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate pr-8">{t.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{t.content}</p>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">{t.fields.length} campos dinâmicos</span>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">ID: {t.id.split('-')[0]}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="apple-card w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Criar Novo Template' : modalMode === 'edit' ? 'Editar Template' : 'Visualizar Template'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome do Template</label>
                <input 
                  type="text" 
                  value={formTemplate.name}
                  onChange={(e) => setFormTemplate({ ...formTemplate, name: e.target.value })}
                  placeholder="Ex: Contrato de Prestação de Serviço"
                  className="apple-input w-full"
                  disabled={modalMode === 'view'}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Conteúdo do Contrato</label>
                <textarea 
                  value={formTemplate.content}
                  onChange={(e) => setFormTemplate({ ...formTemplate, content: e.target.value })}
                  placeholder="Use {{campo}} para partes dinâmicas..."
                  className="apple-input w-full min-h-[200px] font-mono text-sm"
                  disabled={modalMode === 'view'}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Definição de Campos</h3>
                  {modalMode !== 'view' && (
                    <button onClick={handleAddField} className="text-blue-500 text-xs font-bold flex items-center gap-1">
                      <Plus size={14} /> Adicionar Campo
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {formTemplate.fields.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Nenhum campo dinâmico definido.</p>
                  )}
                  {formTemplate.fields.map((field, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl relative border border-gray-100">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Label</span>
                        <input 
                          type="text" 
                          placeholder="Ex: Data da Obra"
                          value={field.label}
                          onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                          className="apple-input text-xs w-full"
                          disabled={modalMode === 'view'}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Chave</span>
                        <input 
                          type="text" 
                          placeholder="Ex: data_obra"
                          value={field.key}
                          onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                          className="apple-input text-xs w-full"
                          disabled={modalMode === 'view'}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Tipo</span>
                        <select 
                          value={field.type}
                          onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                          className="apple-input text-xs w-full"
                          disabled={modalMode === 'view'}
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="date">Data</option>
                        </select>
                      </div>
                      {modalMode !== 'view' && (
                        <button 
                          onClick={() => {
                            const fields = formTemplate.fields.filter((_, i) => i !== idx);
                            setFormTemplate({ ...formTemplate, fields });
                          }}
                          className="absolute -right-2 -top-2 w-6 h-6 bg-white text-red-500 border border-red-100 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="apple-button-secondary flex-1">
                {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
              </button>
              {modalMode !== 'view' && (
                <button onClick={handleSave} className="apple-button-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={18} /> {modalMode === 'create' ? 'Salvar Template' : 'Atualizar Template'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
