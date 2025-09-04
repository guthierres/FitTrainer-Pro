import React, { useEffect, useState } from 'react';
import { Calendar, User, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ActivityItem {
  id: string;
  type: 'assessment' | 'payment' | 'student';
  description: string;
  date: string;
}

export function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivity();
    }
  }, [user]);

  async function loadRecentActivity() {
    try {
      // Get recent assessments
      const { data: avaliacoes } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          data,
          created_at,
          alunos!inner(nome, user_id)
        `)
        .eq('alunos.user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Get recent payments
      const { data: pagamentos } = await supabase
        .from('pagamentos')
        .select(`
          id,
          data_pagamento,
          valor,
          created_at,
          alunos!inner(nome, user_id)
        `)
        .eq('alunos.user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const recentActivities: ActivityItem[] = [];

      // Add assessments
      avaliacoes?.forEach(avaliacao => {
        recentActivities.push({
          id: avaliacao.id,
          type: 'assessment',
          description: `Avaliação física - ${avaliacao.alunos?.nome}`,
          date: avaliacao.created_at
        });
      });

      // Add payments
      pagamentos?.forEach(pagamento => {
        recentActivities.push({
          id: pagamento.id,
          type: 'payment',
          description: `Pagamento recebido - ${pagamento.alunos?.nome} (R$ ${Number(pagamento.valor).toFixed(2)})`,
          date: pagamento.created_at
        });
      });

      // Sort by date and take last 5
      recentActivities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setActivities(recentActivities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'assessment': return Activity;
      case 'payment': return Calendar;
      default: return User;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'assessment': return 'text-blue-600';
      case 'payment': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Atividade Recente
      </h3>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-slate-500 text-center py-4">
              Nenhuma atividade recente
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = getIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-slate-100`}>
                    <Icon className={`h-4 w-4 ${getIconColor(activity.type)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}