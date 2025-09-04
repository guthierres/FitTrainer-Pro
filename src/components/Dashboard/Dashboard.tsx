import React, { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { RecentActivity } from './RecentActivity';
import { OverdueStudents } from './OverdueStudents';
import { supabase, Aluno, Pagamento } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAlunos: 0,
    alunosAtivos: 0,
    inadimplentes: 0,
    receitaMensal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      // Get students data
      const { data: alunos } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user!.id);

      // Get payments data for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: pagamentos } = await supabase
        .from('pagamentos')
        .select('*, alunos(*)')
        .eq('alunos.user_id', user!.id)
        .like('referente_mes', `${currentMonth}%`);

      const totalAlunos = alunos?.length || 0;
      const alunosAtivos = alunos?.filter(a => a.status === 'ativo').length || 0;
      const inadimplentes = alunos?.filter(a => a.status === 'inadimplente').length || 0;
      const receitaMensal = pagamentos
        ?.filter(p => p.status === 'pago')
        .reduce((sum, p) => sum + Number(p.valor), 0) || 0;

      setStats({
        totalAlunos,
        alunosAtivos,
        inadimplentes,
        receitaMensal
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

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
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Alunos"
          value={stats.totalAlunos}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Alunos Ativos"
          value={stats.alunosAtivos}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Inadimplentes"
          value={stats.inadimplentes}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Receita Mensal"
          value={`R$ ${stats.receitaMensal.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).replace('R$', '').trim()}`}
          icon={CreditCard}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <OverdueStudents />
      </div>
    </div>
  );
}