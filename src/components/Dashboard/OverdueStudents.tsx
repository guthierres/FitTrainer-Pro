import React, { useEffect, useState } from 'react';
import { AlertTriangle, User } from 'lucide-react';
import { supabase, Aluno } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export function OverdueStudents() {
  const { user } = useAuth();
  const [overdueStudents, setOverdueStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOverdueStudents();
    }
  }, [user]);

  async function loadOverdueStudents() {
    try {
      const { data: alunos } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'inadimplente')
        .order('created_at', { ascending: false });

      setOverdueStudents(alunos || []);
    } catch (error) {
      console.error('Error loading overdue students:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Alunos Inadimplentes
        </h3>
        <div className="flex items-center space-x-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{overdueStudents.length}</span>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {overdueStudents.length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-slate-500 text-sm">
                Todos os alunos estão em dia!
              </p>
            </div>
          ) : (
            overdueStudents.map((aluno) => (
              <div key={aluno.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {aluno.nome}
                  </p>
                  <p className="text-xs text-red-600">
                    Inadimplente
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}