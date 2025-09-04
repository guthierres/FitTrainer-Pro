/*
  # Initial Schema for Personal Trainer SaaS

  1. New Tables
    - `alunos` (students)
      - Complete student profile with physical data and goals
      - Status tracking (active, inactive, overdue)
    - `exercicios` (exercises)
      - Exercise database with muscle groups and descriptions
    - `treinos` (workouts)
      - Personalized workout assignments linking students and exercises
    - `avaliacoes` (assessments)
      - Physical assessment tracking with measurements and max loads
    - `pagamentos` (payments)
      - Payment tracking with status and reference month

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Trainers can access all data, students only their own

  3. Enums and Types
    - Status types for students and payments
    - Gender types
*/

-- Create enums
CREATE TYPE status_aluno AS ENUM ('ativo', 'inativo', 'inadimplente');
CREATE TYPE sexo AS ENUM ('M', 'F', 'Outro');
CREATE TYPE status_pagamento AS ENUM ('pago', 'pendente', 'atrasado');

-- Create alunos table
CREATE TABLE IF NOT EXISTS alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  data_nascimento date,
  sexo sexo,
  peso numeric(5,2),
  altura numeric(5,2),
  percentual_gordura numeric(5,2),
  objetivo text,
  data_inicio date DEFAULT CURRENT_DATE,
  status status_aluno DEFAULT 'ativo',
  telefone text,
  email text,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create exercicios table
CREATE TABLE IF NOT EXISTS exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  grupo_muscular text NOT NULL,
  descricao text,
  created_at timestamptz DEFAULT now()
);

-- Create treinos table
CREATE TABLE IF NOT EXISTS treinos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  exercicio_id uuid REFERENCES exercicios(id) ON DELETE CASCADE,
  series integer NOT NULL,
  repeticoes integer NOT NULL,
  descanso_segundos integer DEFAULT 60,
  sessoes_semanais integer DEFAULT 3,
  observacoes text,
  created_at timestamptz DEFAULT now()
);

-- Create avaliacoes table
CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  data date DEFAULT CURRENT_DATE,
  peso numeric(5,2),
  percentual_gordura numeric(5,2),
  carga_maxima_supino numeric(6,2),
  carga_maxima_agachamento numeric(6,2),
  observacoes text,
  created_at timestamptz DEFAULT now()
);

-- Create pagamentos table
CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  data_pagamento date,
  valor numeric(10,2) NOT NULL,
  status status_pagamento DEFAULT 'pendente',
  referente_mes text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Policies for alunos
CREATE POLICY "Users can manage their own students"
  ON alunos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for exercicios (accessible to all authenticated users)
CREATE POLICY "Authenticated users can access exercises"
  ON exercicios
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for treinos
CREATE POLICY "Users can manage workouts for their students"
  ON treinos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos 
      WHERE alunos.id = treinos.aluno_id 
      AND alunos.user_id = auth.uid()
    )
  );

-- Policies for avaliacoes
CREATE POLICY "Users can manage assessments for their students"
  ON avaliacoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos 
      WHERE alunos.id = avaliacoes.aluno_id 
      AND alunos.user_id = auth.uid()
    )
  );

-- Policies for pagamentos
CREATE POLICY "Users can manage payments for their students"
  ON pagamentos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos 
      WHERE alunos.id = pagamentos.aluno_id 
      AND alunos.user_id = auth.uid()
    )
  );

-- Insert sample exercises
INSERT INTO exercicios (nome, grupo_muscular, descricao) VALUES
  ('Supino Reto', 'Peito', 'Exercício para desenvolvimento do peitoral maior'),
  ('Agachamento Livre', 'Pernas', 'Exercício composto para quadríceps, glúteos e posteriores'),
  ('Puxada Frontal', 'Costas', 'Exercício para desenvolvimento do latíssimo do dorso'),
  ('Desenvolvimento com Halteres', 'Ombros', 'Exercício para deltoides'),
  ('Rosca Direta', 'Bíceps', 'Exercício para bíceps braquial'),
  ('Tríceps Testa', 'Tríceps', 'Exercício para tríceps braquial'),
  ('Leg Press', 'Pernas', 'Exercício para quadríceps e glúteos'),
  ('Remada Curvada', 'Costas', 'Exercício para romboides e trapézio médio'),
  ('Elevação Lateral', 'Ombros', 'Exercício para deltoides médio'),
  ('Prancha', 'Core', 'Exercício isométrico para core');