import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Dumbbell, BarChart3, CreditCard, User, Phone, Mail, Calendar } from 'lucide-react';
import { supabase, Aluno, Treino, Avaliacao, Pagamento } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [student, setStudent] = useState<Aluno | null>(null);
  const [workouts, setWorkouts] = useState<Treino[]>([]);
  const [assessments, setAssessments] = useState<Avaliacao[]>([]);
  const [payments, setPayments] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadStudentData();
    }
  }, [user, id]);

  async function loadStudentData() {
    try {
      // Load student
      const { data: studentData } = await supabase
        .from('alunos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      // Load workouts
      const { data: workoutsData } = await supabase
        .from('treinos')
        .select(`
          *,
          exercicios(nome, grupo_muscular)
        `)
        .eq('aluno_id', id);

      // Load assessments
      const { data: assessmentsData } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('aluno_id', id)
        .order('data', { ascending: true });

      // Load payments
      const { data: paymentsData } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('aluno_id', id)
        .order('created_at', { ascending: false });

      setStudent(studentData);
      setWorkouts(workoutsData || []);
      setAssessments(assessmentsData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-slate-100 text-slate-800';
      case 'inadimplente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const weightData = assessments.map(assessment => ({
    date: new Date(assessment.data).toLocaleDateString('pt-BR'),
    peso: assessment.peso
  })).filter(item => item.peso);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Aluno não encontrado</p>
        <button
          onClick={() => navigate('/alunos')}
          className="mt-4 text-blue-600 hover:text-blue-500"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/alunos')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{student.nome}</h1>
            <p className="text-slate-600 mt-1">{student.objetivo}</p>
          </div>
        </div>
        
        <Link
          to={`/alunos/${id}/editar`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Link>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-slate-900">Informações Pessoais</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                {student.status}
              </span>
            </div>
            {student.data_nascimento && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Nascimento:</span>
                <span className="text-sm text-slate-900">
                  {new Date(student.data_nascimento).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Início:</span>
              <span className="text-sm text-slate-900">
                {student.data_inicio ? new Date(student.data_inicio).toLocaleDateString('pt-BR') : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Phone className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-slate-900">Contato</h3>
          </div>
          <div className="space-y-3">
            {student.telefone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-900">{student.telefone}</span>
              </div>
            )}
            {student.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-900">{student.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-slate-900">Dados Atuais</h3>
          </div>
          <div className="space-y-3">
            {student.peso && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Peso:</span>
                <span className="text-sm text-slate-900">{student.peso} kg</span>
              </div>
            )}
            {student.altura && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Altura:</span>
                <span className="text-sm text-slate-900">{student.altura} cm</span>
              </div>
            )}
            {student.percentual_gordura && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">% Gordura:</span>
                <span className="text-sm text-slate-900">{student.percentual_gordura}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to={`/treinos?aluno=${id}`}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Dumbbell className="h-5 w-5" />
          <span className="font-medium">Gerenciar Treinos</span>
        </Link>
        
        <Link
          to={`/avaliacoes?aluno=${id}`}
          className="flex items-center justify-center space-x-2 bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <BarChart3 className="h-5 w-5" />
          <span className="font-medium">Nova Avaliação</span>
        </Link>
        
        <Link
          to={`/pagamentos?aluno=${id}`}
          className="flex items-center justify-center space-x-2 bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <CreditCard className="h-5 w-5" />
          <span className="font-medium">Gerenciar Pagamentos</span>
        </Link>
      </div>

      {/* Weight Evolution Chart */}
      {weightData.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Evolução do Peso</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Observations */}
      {student.observacoes && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Observações Médicas</h3>
          <p className="text-slate-600">{student.observacoes}</p>
        </div>
      )}
    </div>
  );
}