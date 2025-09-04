import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase, Aluno, Avaliacao } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function AssessmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    aluno_id: '',
    data: new Date().toISOString().split('T')[0],
    peso: '',
    percentual_gordura: '',
    carga_maxima_supino: '',
    carga_maxima_agachamento: '',
    observacoes: ''
  });

  useEffect(() => {
    loadInitialData();
    if (isEditing && id) {
      loadAssessment();
    }
  }, [isEditing, id]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'ativo')
        .order('nome');

      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAssessment() {
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          alunos!inner(user_id)
        `)
        .eq('id', id)
        .eq('alunos.user_id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          aluno_id: data.aluno_id,
          data: data.data,
          peso: data.peso ? String(data.peso) : '',
          percentual_gordura: data.percentual_gordura ? String(data.percentual_gordura) : '',
          carga_maxima_supino: data.carga_maxima_supino ? String(data.carga_maxima_supino) : '',
          carga_maxima_agachamento: data.carga_maxima_agachamento ? String(data.carga_maxima_agachamento) : '',
          observacoes: data.observacoes || ''
        });
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      setError('Erro ao carregar avaliação');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const assessmentData = {
        aluno_id: formData.aluno_id,
        data: formData.data,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        percentual_gordura: formData.percentual_gordura ? parseFloat(formData.percentual_gordura) : null,
        carga_maxima_supino: formData.carga_maxima_supino ? parseFloat(formData.carga_maxima_supino) : null,
        carga_maxima_agachamento: formData.carga_maxima_agachamento ? parseFloat(formData.carga_maxima_agachamento) : null,
        observacoes: formData.observacoes || null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('avaliacoes')
          .update(assessmentData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('avaliacoes')
          .insert(assessmentData);

        if (error) throw error;
      }

      navigate('/avaliacoes');
    } catch (error) {
      console.error('Error saving assessment:', error);
      setError('Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/avaliacoes')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Atualize os dados da avaliação' : 'Registre uma nova avaliação física'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Aluno *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.aluno_id}
                onChange={(e) => handleInputChange('aluno_id', e.target.value)}
              >
                <option value="">Selecione um aluno</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data da avaliação *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.peso}
                onChange={(e) => handleInputChange('peso', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Percentual de gordura (%)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.percentual_gordura}
                onChange={(e) => handleInputChange('percentual_gordura', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Carga máxima supino (kg)
              </label>
              <input
                type="number"
                step="0.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.carga_maxima_supino}
                onChange={(e) => handleInputChange('carga_maxima_supino', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Carga máxima agachamento (kg)
              </label>
              <input
                type="number"
                step="0.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.carga_maxima_agachamento}
                onChange={(e) => handleInputChange('carga_maxima_agachamento', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Notas sobre a avaliação, progressos observados, etc."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/avaliacoes')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}