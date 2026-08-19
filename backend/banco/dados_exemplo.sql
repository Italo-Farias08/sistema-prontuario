-- =====================================================================
-- Dados de exemplo — mesmo conteúdo que estava em dadosMock.js
-- Senha de todos os usuários de exemplo: "123456"
-- =====================================================================

-- Paciente 1: Marina Alves Ferreira
WITH novo_paciente AS (
  INSERT INTO pacientes (
    nome, sexo, data_nascimento, telefone, contato_emergencia, cpf, email, endereco, foto_iniciais,
    comorbidades, alergias, habitos,
    resumo_historia, resultado_exames, plano_terapeutico,
    historia_doenca, sono, apetite, libido, humor, energia, concentracao, funcionalidade,
    uso_substancias, outras_substancias_descricao,
    ideacao_suicida_resposta, ideacao_suicida_observacao,
    heteroagressao_resposta, heteroagressao_funcao,
    sintomas_psicoticos_resposta, sintomas_psicoticos_funcao
  ) VALUES (
    'Marina Alves Ferreira', 'Feminino', '1991-04-12', '(81) 99123-4567',
    'Carlos Ferreira - (81) 99876-1234', '123.456.789-00', 'marina.alves@email.com',
    'Rua das Acácias, 245 - Vitória de Santo Antão, PE', 'MA',
    'Hipotireoidismo', 'Dipirona', 'Não fumante, etilismo social',
    'Acompanhamento iniciado em 2023 para manejo de sintomas ansiosos e alterações do sono. Evolução progressiva com boa resposta terapêutica.',
    'Hemograma, função tireoidiana e vitamina D dentro da normalidade (última coleta: 03/2026).',
    'Manter medicação atual, psicoterapia quinzenal e reavaliação em 30 dias. Orientada sobre higiene do sono.',
    'Paciente relata quadro ansioso há aproximadamente 2 anos, com piora nos últimos 3 meses associada a fatores ocupacionais. Nega episódios depressivos maiores prévios.',
    'Fragmentado', 'Reduzido', 'Normal', 'Estável', 'Reduzida', 'Regular', 'Parcialmente',
    'Álcool', '',
    'Não', '', 'Não', '', 'Não', ''
  )
  RETURNING id
)
INSERT INTO usuarios (perfil, email, senha_hash, paciente_id)
SELECT 'cliente', 'marina.alves@email.com', crypt('123456', gen_salt('bf')), id FROM novo_paciente;

INSERT INTO medicacoes (paciente_id, nome, dosagem, horario)
SELECT id, 'Escitalopram', '10mg', '1x ao dia - manhã' FROM pacientes WHERE cpf = '123.456.789-00';
INSERT INTO medicacoes (paciente_id, nome, dosagem, horario)
SELECT id, 'Trazodona', '50mg', '1x ao dia - noite' FROM pacientes WHERE cpf = '123.456.789-00';

INSERT INTO checkins (paciente_id, data, sono, apetite, humor, energia)
SELECT id, d.data, d.sono, d.apetite, d.humor, d.energia FROM pacientes,
  (VALUES
    ('2026-08-12'::date, 60, 70, 80, 55),
    ('2026-08-13'::date, 55, 65, 75, 60),
    ('2026-08-14'::date, 70, 72, 78, 65),
    ('2026-08-15'::date, 50, 68, 82, 58),
    ('2026-08-16'::date, 65, 74, 85, 70),
    ('2026-08-17'::date, 72, 76, 88, 74),
    ('2026-08-18'::date, 68, 80, 90, 78)
  ) AS d(data, sono, apetite, humor, energia)
WHERE cpf = '123.456.789-00';

-- Paciente 2: João Pedro Souza
WITH novo_paciente AS (
  INSERT INTO pacientes (
    nome, sexo, data_nascimento, telefone, contato_emergencia, cpf, email, endereco, foto_iniciais,
    comorbidades, alergias, habitos,
    resumo_historia, resultado_exames, plano_terapeutico,
    historia_doenca, sono, apetite, libido, humor, energia, concentracao, funcionalidade,
    uso_substancias, outras_substancias_descricao,
    ideacao_suicida_resposta, ideacao_suicida_observacao,
    heteroagressao_resposta, heteroagressao_funcao,
    sintomas_psicoticos_resposta, sintomas_psicoticos_funcao
  ) VALUES (
    'João Pedro Souza', 'Masculino', '1984-09-05', '(81) 99222-3344',
    'Ana Souza - (81) 99654-3322', '987.654.321-00', 'joaopedro.souza@email.com',
    'Av. Central, 980 - Vitória de Santo Antão, PE', 'JS',
    'Nenhuma', 'Nenhuma conhecida', 'Ex-tabagista (parou há 3 anos)',
    'Acompanhamento iniciado em 2024 para manejo de sintomas do humor. Quadro atualmente estável.',
    'Exames laboratoriais de rotina sem alterações relevantes (02/2026).',
    'Manutenção da medicação, retorno em 45 dias.',
    'Histórico de episódios de humor elevado intercalados com períodos eutímicos prolongados. Boa adesão ao tratamento.',
    'Normal', 'Normal', 'Normal', 'Estável', 'Normal', 'Boa', 'Mantida',
    'Não', '',
    'Não', '', 'Não', '', 'Não', ''
  )
  RETURNING id
)
INSERT INTO usuarios (perfil, email, senha_hash, paciente_id)
SELECT 'cliente', 'joaopedro.souza@email.com', crypt('123456', gen_salt('bf')), id FROM novo_paciente;

INSERT INTO medicacoes (paciente_id, nome, dosagem, horario)
SELECT id, 'Lítio', '300mg', '2x ao dia' FROM pacientes WHERE cpf = '987.654.321-00';

INSERT INTO checkins (paciente_id, data, sono, apetite, humor, energia)
SELECT id, d.data, d.sono, d.apetite, d.humor, d.energia FROM pacientes,
  (VALUES
    ('2026-08-12'::date, 80, 82, 85, 80),
    ('2026-08-13'::date, 78, 80, 84, 79),
    ('2026-08-14'::date, 82, 83, 88, 81),
    ('2026-08-15'::date, 79, 81, 86, 78),
    ('2026-08-16'::date, 85, 84, 90, 83),
    ('2026-08-17'::date, 83, 85, 89, 85),
    ('2026-08-18'::date, 86, 87, 91, 86)
  ) AS d(data, sono, apetite, humor, energia)
WHERE cpf = '987.654.321-00';

-- Usuário administrador (médico/consultório)
INSERT INTO usuarios (perfil, email, senha_hash, paciente_id)
VALUES ('admin', 'admin@clinica.com', crypt('123456', gen_salt('bf')), NULL);
