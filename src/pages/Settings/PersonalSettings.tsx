import React, { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { supabase, PersonalInfo } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function PersonalSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: 'Áquila',
    registro: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  useEffect(() => {
    if (user) {
      loadPersonalInfo();
    }
  }, [user]);

  async function loadPersonalInfo() {
    try {
      let { data } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (!data) {
        // Create default if doesn't exist
        const { data: newData, error } = await supabase
          .from('personal_info')
          .insert({
            nome: 'Áquila',
            user_id: user!.id
          })
          .select()
          .single();

        if (error) throw error;
        data = newData;
      }

      setFormData({
        nome: data.nome || 'Áquila',
        registro: data.registro || '',
        telefone: data.telefone || '',
        email: data.email || '',
        endereco: data.endereco || ''
      });
    } catch (error) {
      console.error('Error loading personal info:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('personal_info')
        .upsert({
          ...formData,
          user_id: user!.id
        });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving personal info:', error);
      setError('Erro ao salvar informações');
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações do Personal</h1>
        <p className="text-slate-600 mt-1">Gerencie suas informações profissionais</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              Informações salvas com sucesso!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome completo *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Registro profissional
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.registro}
                onChange={(e) => handleInputChange('registro', e.target.value)}
                placeholder="Ex: CREF 123456-G/SP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-mail profissional
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Endereço completo
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, número, bairro, cidade, CEP"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Informações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}