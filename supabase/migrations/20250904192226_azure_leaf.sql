/*
  # Adicionar exercícios padrão e informações do personal

  1. New Tables
    - `personal_info` - Informações do personal trainer
      - `id` (uuid, primary key)
      - `nome` (text)
      - `registro` (text)
      - `telefone` (text)
      - `email` (text)
      - `endereco` (text)
      - `user_id` (uuid, foreign key)

  2. Data
    - Inserir exercícios padrão organizados por categoria
    - Inserir informações padrão do personal Áquila

  3. Security
    - Enable RLS on `personal_info` table
    - Add policy for authenticated users to manage their own info
*/

-- Create personal_info table
CREATE TABLE IF NOT EXISTS personal_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT 'Áquila',
  registro text,
  telefone text,
  email text,
  endereco text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own personal info"
  ON personal_info
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default exercises
INSERT INTO exercicios (nome, grupo_muscular, descricao) VALUES
-- Peito
('Supino reto', 'Peito', 'Exercício básico para desenvolvimento do peitoral'),
('Supino inclinado', 'Peito', 'Foco na porção superior do peitoral'),
('Supino declinado', 'Peito', 'Foco na porção inferior do peitoral'),
('Crucifixo (máquina, halteres ou cross)', 'Peito', 'Exercício de isolamento para peitoral'),
('Peck deck', 'Peito', 'Exercício de isolamento na máquina'),

-- Costas
('Puxada frente (pulldown)', 'Costas', 'Exercício para desenvolvimento do latíssimo'),
('Puxada atrás', 'Costas', 'Variação da puxada para costas'),
('Remada curvada', 'Costas', 'Exercício composto para costas'),
('Remada baixa (máquina ou polia)', 'Costas', 'Exercício para meio das costas'),
('Remada unilateral com halter', 'Costas', 'Exercício unilateral para costas'),
('Barra fixa', 'Costas', 'Exercício com peso corporal'),

-- Pernas
('Agachamento livre', 'Pernas', 'Exercício fundamental para pernas'),
('Agachamento no smith', 'Pernas', 'Variação mais segura do agachamento'),
('Leg press', 'Pernas', 'Exercício na máquina para pernas'),
('Cadeira extensora', 'Pernas', 'Isolamento para quadríceps'),
('Cadeira flexora', 'Pernas', 'Isolamento para posterior de coxa'),
('Stiff (levantamento terra romeno)', 'Pernas', 'Exercício para posterior e glúteos'),
('Afundo / Passada', 'Pernas', 'Exercício unilateral para pernas'),
('Panturrilha em pé', 'Pernas', 'Exercício para panturrilha'),
('Panturrilha sentado', 'Pernas', 'Variação sentada para panturrilha'),

-- Ombros
('Desenvolvimento (halteres ou máquina)', 'Ombros', 'Exercício básico para ombros'),
('Elevação lateral', 'Ombros', 'Isolamento para deltóide médio'),
('Elevação frontal', 'Ombros', 'Isolamento para deltóide anterior'),
('Remada alta', 'Ombros', 'Exercício para deltóide posterior'),
('Crucifixo inverso (posterior de ombro)', 'Ombros', 'Isolamento para deltóide posterior'),

-- Bíceps
('Rosca direta', 'Braços', 'Exercício básico para bíceps'),
('Rosca alternada', 'Braços', 'Variação alternada da rosca'),
('Rosca concentrada', 'Braços', 'Exercício de isolamento para bíceps'),
('Rosca martelo', 'Braços', 'Exercício para bíceps e antebraço'),
('Rosca scott', 'Braços', 'Exercício no banco scott'),

-- Tríceps
('Tríceps pulley (barra ou corda)', 'Braços', 'Exercício na polia para tríceps'),
('Tríceps testa', 'Braços', 'Exercício deitado para tríceps'),
('Tríceps francês', 'Braços', 'Exercício sentado para tríceps'),
('Mergulho entre bancos', 'Braços', 'Exercício com peso corporal'),

-- Abdômen
('Prancha', 'Abdômen', 'Exercício isométrico para core'),
('Abdominal crunch', 'Abdômen', 'Exercício básico para abdômen'),
('Abdominal infra', 'Abdômen', 'Foco na porção inferior do abdômen'),
('Abdominal oblíquo', 'Abdômen', 'Exercício para músculos oblíquos'),
('Elevação de pernas na barra fixa', 'Abdômen', 'Exercício suspenso para abdômen'),
('Abdominal máquina', 'Abdômen', 'Exercício na máquina para abdômen')

ON CONFLICT (nome, grupo_muscular) DO NOTHING;