import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Aluno {
  id: string;
  nome: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F' | 'Outro';
  peso?: number;
  altura?: number;
  percentual_gordura?: number;
  objetivo?: string;
  data_inicio?: string;
  status: 'ativo' | 'inativo' | 'inadimplente';
  telefone?: string;
  email?: string;
  observacoes?: string;
  created_at: string;
  user_id: string;
}

export interface Exercicio {
  id: string;
  nome: string;
  grupo_muscular: string;
  descricao?: string;
  created_at: string;
}

export interface Treino {
  id: string;
  aluno_id: string;
  exercicio_id: string;
  series: number;
  repeticoes: number;
  descanso_segundos: number;
  sessoes_semanais: number;
  observacoes?: string;
  created_at: string;
  exercicios?: Exercicio;
}

export interface Avaliacao {
  id: string;
  aluno_id: string;
  data: string;
  peso?: number;
  percentual_gordura?: number;
  carga_maxima_supino?: number;
  carga_maxima_agachamento?: number;
  observacoes?: string;
  created_at: string;
}

export interface Pagamento {
  id: string;
  aluno_id: string;
  data_pagamento?: string;
  valor: number;
  status: 'pago' | 'pendente' | 'atrasado';
  referente_mes: string;
  created_at: string;
}