import React, { useEffect, useState } from 'react';
import { X, Printer } from 'lucide-react';
import { supabase, Aluno, Treino, PersonalInfo } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface WorkoutPrintProps {
  student: Aluno;
  workouts: Treino[];
  onClose: () => void;
}

export function WorkoutPrint({ student, workouts, onClose }: WorkoutPrintProps) {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);

  useEffect(() => {
    loadPersonalInfo();
  }, []);

  async function loadPersonalInfo() {
    try {
      let { data } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (!data) {
        // Create default personal info if doesn't exist
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

      setPersonalInfo(data);
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const groupedWorkouts = workouts.reduce((acc, workout) => {
    const category = workout.exercicios?.grupo_muscular || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(workout);
    return acc;
  }, {} as Record<string, Treino[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 print:hidden">
          <h2 className="text-xl font-bold text-slate-900">
            Ficha de Treino - {student.nome}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible">
          {/* Print Styles */}
          <style jsx>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-area, .print-area * {
                visibility: visible;
              }
              .print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              @page {
                margin: 1cm;
                size: A4;
              }
            }
          `}</style>

          <div className="print-area">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                FICHA DE TREINO
              </h1>
              <div className="text-sm text-slate-600">
                <p><strong>Personal Trainer:</strong> {personalInfo?.nome || 'Áquila'}</p>
                {personalInfo?.registro && (
                  <p><strong>Registro:</strong> {personalInfo.registro}</p>
                )}
                {personalInfo?.telefone && (
                  <p><strong>Telefone:</strong> {personalInfo.telefone}</p>
                )}
                {personalInfo?.email && (
                  <p><strong>E-mail:</strong> {personalInfo.email}</p>
                )}
              </div>
            </div>

            {/* Student Info */}
            <div className="mb-6 bg-slate-50 p-4 rounded-lg print:bg-gray-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">DADOS DO ALUNO</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Nome:</strong> {student.nome}</p>
                  <p><strong>Objetivo:</strong> {student.objetivo || 'Não informado'}</p>
                  {student.data_nascimento && (
                    <p><strong>Data de Nascimento:</strong> {new Date(student.data_nascimento).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
                <div>
                  {student.peso && <p><strong>Peso:</strong> {student.peso} kg</p>}
                  {student.altura && <p><strong>Altura:</strong> {student.altura} cm</p>}
                  {student.percentual_gordura && <p><strong>% Gordura:</strong> {student.percentual_gordura}%</p>}
                </div>
              </div>
            </div>

            {/* Workout Plan */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">PLANO DE TREINO</h2>
              
              {Object.entries(groupedWorkouts).map(([category, categoryWorkouts]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-md font-bold text-slate-800 mb-3 bg-slate-100 p-2 rounded">
                    {category.toUpperCase()}
                  </h3>
                  
                  <div className="space-y-3">
                    {categoryWorkouts.map((workout, index) => (
                      <div key={workout.id} className="border border-slate-300 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-900">
                            {index + 1}. {workout.exercicios?.nome}
                          </h4>
                          <div className="text-sm text-slate-600">
                            {workout.series} x {workout.repeticoes}
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 space-y-1">
                          <p><strong>Descanso:</strong> {workout.descanso_segundos}s</p>
                          {workout.observacoes && (
                            <p><strong>Obs:</strong> {workout.observacoes}</p>
                          )}
                        </div>

                        {/* Execution tracking */}
                        <div className="mt-3 border-t border-slate-200 pt-2">
                          <p className="text-xs text-slate-500 mb-2">Controle de execução:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="text-center">
                                <div className="border border-slate-300 rounded h-8 mb-1"></div>
                                <span className="text-xs text-slate-400">Sem {i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t-2 border-slate-900 pt-4 text-center text-xs text-slate-600">
              <p className="mb-2">
                <strong>Data de criação:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
              {personalInfo?.endereco && (
                <p className="mb-2">{personalInfo.endereco}</p>
              )}
              <p>
                Gerado por FitTrainer Pro - ID do Aluno: {student.id.slice(0, 8)}
              </p>
              <p className="mt-2 text-slate-500">
                Sistema disponível em: https://fittrainer-pro.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}