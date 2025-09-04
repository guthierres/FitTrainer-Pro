import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { supabase, Exercicio, WorkoutExercise } from '../../lib/supabase';

interface WorkoutBuilderProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
  onSave: () => void;
}

export function WorkoutBuilder({ studentId, studentName, onClose, onSave }: WorkoutBuilderProps) {
  const [exercises, setExercises] = useState<Exercicio[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    'all',
    'Peito',
    'Costas', 
    'Pernas',
    'Ombros',
    'Braços',
    'Abdômen'
  ];

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      const { data } = await supabase
        .from('exercicios')
        .select('*')
        .order('grupo_muscular, nome');

      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredExercises = exercises.filter(exercise => 
    selectedCategory === 'all' || exercise.grupo_muscular === selectedCategory
  );

  const addExercise = (exercise: Exercicio) => {
    const newWorkoutExercise: WorkoutExercise = {
      exercicio_id: exercise.id,
      series: 3,
      repeticoes: 12,
      descanso_segundos: 60,
      observacoes: '',
      exercicio: exercise
    };
    setSelectedExercises([...selectedExercises, newWorkoutExercise]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSave = async () => {
    if (selectedExercises.length === 0) return;

    setSaving(true);
    try {
      // Delete existing workouts for this student
      await supabase
        .from('treinos')
        .delete()
        .eq('aluno_id', studentId);

      // Insert new workouts
      const workoutsToInsert = selectedExercises.map(exercise => ({
        aluno_id: studentId,
        exercicio_id: exercise.exercicio_id,
        series: exercise.series,
        repeticoes: exercise.repeticoes,
        descanso_segundos: exercise.descanso_segundos,
        sessoes_semanais: 3,
        observacoes: exercise.observacoes || null
      }));

      const { error } = await supabase
        .from('treinos')
        .insert(workoutsToInsert);

      if (error) throw error;

      onSave();
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Criar Treino - {studentName}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Selecione exercícios e configure séries e repetições
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Exercise Selection */}
          <div className="w-1/2 p-6 border-r border-slate-200 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoria
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                filteredExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => addExercise(exercise)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{exercise.nome}</h4>
                        <p className="text-sm text-slate-500">{exercise.grupo_muscular}</p>
                      </div>
                      <Plus className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Exercises */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Exercícios Selecionados ({selectedExercises.length})
            </h3>

            {selectedExercises.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Selecione exercícios da lista ao lado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedExercises.map((workoutExercise, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {workoutExercise.exercicio?.nome}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {workoutExercise.exercicio?.grupo_muscular}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExercise(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Séries
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          value={workoutExercise.series}
                          onChange={(e) => updateExercise(index, 'series', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Repetições
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          value={workoutExercise.repeticoes}
                          onChange={(e) => updateExercise(index, 'repeticoes', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Descanso (s)
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          value={workoutExercise.descanso_segundos}
                          onChange={(e) => updateExercise(index, 'descanso_segundos', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Observações
                      </label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Carga inicial 20kg"
                        value={workoutExercise.observacoes || ''}
                        onChange={(e) => updateExercise(index, 'observacoes', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedExercises.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Treino'}
          </button>
        </div>
      </div>
    </div>
  );
}