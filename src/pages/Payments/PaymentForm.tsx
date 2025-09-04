import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase, Aluno, Pagamento } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function PaymentForm() {
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
    data_pagamento: '',
    valor: '',
    status: 'pendente' as 'pago' | 'pendente' | 'atrasado',
    referente_mes: new Date().toISOString().slice(0, 7) // YYYY-MM
  });

  useEffect(() => {
    loadInitialData();
    if (isEditing && id) {
      loadPayment();
    }
  }, [isEditing, id]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user!.id)
        .order('nome');

      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPayment() {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
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
          data_pagamento: data.data_pagamento || '',
          valor: String(data.valor),
          status: data.status,
          referente_mes: data.referente_mes
        });
      }
    } catch (error) {
      console.error('Error loading payment:', error);
      setError('Erro ao carregar pagamento');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const paymentData = {
        aluno_id: formData.aluno_id,
        data_pagamento: formData.data_pagamento || null,
        valor: parseFloat(formData.valor),
        status: formData.status,
        referente_mes: formData.referente_mes
      };

      if (isEditing) {
        const { error } = await supabase
          .from('pagamentos')
          .update(paymentData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pagamentos')
          .insert(paymentData);

        if (error) throw error;
      }

      navigate('/pagamentos');
    } catch (error) {
      console.error('Error saving payment:', error);
      setError('Erro ao salvar pagamento');
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
          onClick={() => navigate('/pagamentos')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Pagamento' : 'Novo Pagamento'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Atualize as informações do pagamento' : 'Registre um novo pagamento'}
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
                Referente ao mês *
              </label>
              <input
                type="month"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.referente_mes}
                onChange={(e) => handleInputChange('referente_mes', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data do pagamento
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.data_pagamento}
                onChange={(e) => handleInputChange('data_pagamento', e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Deixe em branco se ainda não foi pago
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/pagamentos')}
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