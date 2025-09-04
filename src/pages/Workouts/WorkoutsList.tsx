import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Dumbbell, User, Clock } from 'lucide-react';
import { supabase, Treino, Aluno } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function WorkoutsList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const alunoFilter = searchParams.get('aluno');
  
  const [workouts, setWorkouts] = useState<(Treino & { alunos?: Aluno })[]>([]);
  const [students, setStudents] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(alunoFilter || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (alunoFilter) {
      setSelectedStudent(alunoFilter);
    }
  }, [alunoFilter]);

  async function loadData() {
    try {
      // Load students
      const { data: studentsData } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user!.id)
        .order('nome');

      // Load workouts with exercise and student info
      const { data: workoutsData } = await supabase
        .from('treinos')
        .select(`
          *,
          exercicios(nome, grupo_muscular),
          alunos!inner(id, nome, user_id)
        `)
        .eq('alunos.user_id', user!.id)
        .order('created_at', { ascending: false });

      setStudents(studentsData || []);
      setWorkouts(workoutsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = !searchTerm || 
      workout.exercicios?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.alunos?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStudent = selectedStudent === 'all' || workout.aluno_id === selectedStudent;
    
    return matchesSearch && matchesStudent;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Treinos</h1>
          <p className="text-slate-600 mt-1">Gerencie os treinos dos seus alunos</p>
        </div>
        <Link
          to="/treinos/novo"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Treino
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar exercício ou aluno..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="all">Todos os alunos</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workouts List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Nenhum treino encontrado</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm || selectedStudent !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando treinos para seus alunos.'}
            </p>
            {!searchTerm && selectedStudent === 'all' && (
              <div className="mt-6">
                <Link
                  to="/treinos/novo"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Treino
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredWorkouts.map((workout) => (
              <div key={workout.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-slate-900">
                        {workout.exercicios?.nome}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {workout.exercicios?.grupo_muscular}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {workout.alunos?.nome}
                      </div>
                      <div className="flex items-center">
                        <Dumbbell className="h-4 w-4 mr-1" />
                        {workout.series}x{workout.repeticoes}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {workout.descanso_segundos}s descanso
                      </div>
                      <div>
                        {workout.sessoes_semanais}x/semana
                      </div>
                    </div>
                    {workout.observacoes && (
                      <p className="mt-2 text-sm text-slate-600">
                        {workout.observacoes}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/treinos/${workout.id}/editar`}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}