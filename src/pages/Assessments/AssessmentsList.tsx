import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, BarChart3, User, Calendar } from 'lucide-react';
import { supabase, Avaliacao, Aluno } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function AssessmentsList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const alunoFilter = searchParams.get('aluno');
  
  const [assessments, setAssessments] = useState<(Avaliacao & { alunos?: Aluno })[]>([]);
  const [students, setStudents] = useState<Aluno[]>([]);
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

      // Load assessments
      const { data: assessmentsData } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          alunos!inner(id, nome, user_id)
        `)
        .eq('alunos.user_id', user!.id)
        .order('data', { ascending: false });

      setStudents(studentsData || []);
      setAssessments(assessmentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAssessments = assessments.filter(assessment => 
    selectedStudent === 'all' || assessment.aluno_id === selectedStudent
  );

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
          <h1 className="text-3xl font-bold text-slate-900">Avaliações</h1>
          <p className="text-slate-600 mt-1">Acompanhe a evolução dos seus alunos</p>
        </div>
        <Link
          to="/avaliacoes/nova"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">
            Filtrar por aluno:
          </label>
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

      {/* Assessments List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Nenhuma avaliação encontrada</h3>
            <p className="mt-1 text-sm text-slate-500">
              Comece realizando avaliações físicas dos seus alunos.
            </p>
            <div className="mt-6">
              <Link
                to="/avaliacoes/nova"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Peso (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    % Gordura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supino Máx (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">
                            {assessment.alunos?.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">
                          {new Date(assessment.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {assessment.peso ? `${assessment.peso} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {assessment.percentual_gordura ? `${assessment.percentual_gordura}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {assessment.carga_maxima_supino ? `${assessment.carga_maxima_supino} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/avaliacoes/${assessment.id}/editar`}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}