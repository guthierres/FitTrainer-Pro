import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase, Aluno, Exercicio, Treino } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function WorkoutForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  
  const [students, setStudents] = useState<Aluno[]>([]);
  const [exercises, setExercises] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    aluno_id: '',
    exercicio_id: '',
    series: '',
    repeticoes: '',
    descanso_segundos: '60',
    sessoes_semanais: '3',
    observacoes: ''
  });

  useEffect(() => {
    loadInitialData();
    if (isEditing && id) {
      loadWorkout();
    }
  }, [isEditing, id]);

  async function loadInitialData() {
    setLoading(true);
    try {
      // Load students
      const { data: studentsData } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'ativo')
        .order('nome');

      // Load exercises
      const { data: exercisesData } = await supabase
        .from('exercicios')
        .select('*')
        .order('nome');

      setStudents(studentsData || []);
      setExercises(exercisesData || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkout() {
    try {
      const { data, error } = await supabase
        .from('treinos')
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
          exercicio_id: data.exercicio_id,
          series: String(data.series),
          repeticoes: String(data.repeticoes),
          descanso_segundos: String(data.descanso_segundos),
          sessoes_semanais: String(data.sessoes_semanais),
          observacoes: data.observacoes || ''
        });
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      setError('Erro ao carregar treino');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const workoutData = {
        aluno_id: formData.aluno_id,
        exercicio_id: formData.exercicio_id,
        series: parseInt(formData.series),
        repeticoes: parseInt(formData.repeticoes),
        descanso_segundos: parseInt(formData.descanso_segundos),
        sessoes_semanais: parseInt(formData.sessoes_semanais),
        observacoes: formData.observacoes || null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('treinos')
          .update(workoutData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('treinos')
          .insert(workoutData);

        if (error) throw error;
      }

      navigate('/treinos');
    } catch (error) {
      console.error('Error saving workout:', error);
      setError('Erro ao salvar treino');
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
          onClick={() => navigate('/treinos')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Treino' : 'Novo Treino'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Atualize as informações do treino' : 'Crie um novo treino personalizado'}
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
                Exercício *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.exercicio_id}
                onChange={(e) => handleInputChange('exercicio_id', e.target.value)}
              >
                <option value="">Selecione um exercício</option>
                {exercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.nome} ({exercise.grupo_muscular})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Séries *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.series}
                onChange={(e) => handleInputChange('series', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Repetições *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.repeticoes}
                onChange={(e) => handleInputChange('repeticoes', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descanso (segundos)
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.descanso_segundos}
                onChange={(e) => handleInputChange('descanso_segundos', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sessões por semana
              </label>
              <input
                type="number"
                min="1"
                max="7"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.sessoes_semanais}
                onChange={(e) => handleInputChange('sessoes_semanais', e.target.value)}
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
              placeholder="Dicas de execução, progressão, etc."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/treinos')}
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