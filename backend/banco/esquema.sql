-- =====================================================================
-- Esquema do banco de dados — Sistema de Prontuário
-- PostgreSQL (Railway)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid() e crypt()

-- ---------------------------------------------------------------------
-- Tabela: pacientes
-- Dados de cadastro do paciente + informações clínicas + prontuário.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pacientes (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cadastro do paciente
  nome                            VARCHAR(255) NOT NULL,
  sexo                            VARCHAR(20),
  data_nascimento                 DATE,
  telefone                        VARCHAR(30),
  contato_emergencia              VARCHAR(255),
  cpf                             VARCHAR(20) UNIQUE,
  email                           VARCHAR(255),
  endereco                        TEXT,
  foto_iniciais                   VARCHAR(4),

  -- Dados clínicos (uso exclusivo do consultório)
  comorbidades                    TEXT,
  alergias                        TEXT,
  habitos                         TEXT,

  -- Ficha de resumo (visível ao paciente)
  resumo_historia                 TEXT,
  resultado_exames                TEXT,
  plano_terapeutico               TEXT,

  -- Prontuário (uso exclusivo do médico)
  historia_doenca                 TEXT,
  sono                            VARCHAR(50),
  apetite                         VARCHAR(50),
  libido                          VARCHAR(50),
  humor                           VARCHAR(50),
  energia                         VARCHAR(50),
  concentracao                    VARCHAR(50),
  funcionalidade                  VARCHAR(50),
  uso_substancias                 VARCHAR(50),
  outras_substancias_descricao    TEXT,

  ideacao_suicida_resposta        VARCHAR(20),
  ideacao_suicida_observacao      TEXT,
  heteroagressao_resposta         VARCHAR(20),
  heteroagressao_funcao           TEXT,
  sintomas_psicoticos_resposta    VARCHAR(20),
  sintomas_psicoticos_funcao      TEXT,

  criado_em                       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Tabela: usuarios
-- Login do sistema. perfil = 'admin' (médico/consultório) ou 'cliente'
-- (paciente). Usuário 'cliente' está vinculado a um paciente.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil            VARCHAR(10) NOT NULL CHECK (perfil IN ('admin', 'cliente')),
  email             VARCHAR(255) NOT NULL UNIQUE,
  senha_hash        TEXT NOT NULL,
  paciente_id       UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  email_verificado  BOOLEAN NOT NULL DEFAULT false,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT usuario_cliente_precisa_paciente
    CHECK (perfil <> 'cliente' OR paciente_id IS NOT NULL)
);

-- Garante a coluna também em bancos onde a tabela usuarios já existia
-- antes desta atualização (torna a migração segura de rodar de novo).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_usuarios_paciente_id ON usuarios(paciente_id);

-- ---------------------------------------------------------------------
-- Tabela: codigos_verificacao
-- Códigos de 6 dígitos enviados por e-mail (via Brevo) para confirmar
-- o cadastro do cliente ou autorizar a redefinição de senha.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS codigos_verificacao (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL,
  codigo        VARCHAR(6) NOT NULL,
  tipo          VARCHAR(20) NOT NULL CHECK (tipo IN ('cadastro', 'redefinir_senha')),
  tentativas    SMALLINT NOT NULL DEFAULT 0,
  usado         BOOLEAN NOT NULL DEFAULT false,
  expira_em     TIMESTAMPTZ NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_codigos_verificacao_email_tipo ON codigos_verificacao(email, tipo);

-- ---------------------------------------------------------------------
-- Tabela: medicacoes
-- Medicações em uso de cada paciente.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id   UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nome          VARCHAR(255) NOT NULL,
  dosagem       VARCHAR(100),
  horario       VARCHAR(100),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medicacoes_paciente_id ON medicacoes(paciente_id);

-- ---------------------------------------------------------------------
-- Tabela: checkins
-- Check-ins diários que o paciente registra pelo app (humor/sono/energia).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id   UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  data          DATE NOT NULL DEFAULT CURRENT_DATE,
  sono          SMALLINT CHECK (sono BETWEEN 0 AND 100),
  apetite       SMALLINT CHECK (apetite BETWEEN 0 AND 100),
  humor         SMALLINT CHECK (humor BETWEEN 0 AND 100),
  energia       SMALLINT CHECK (energia BETWEEN 0 AND 100),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkins_paciente_id ON checkins(paciente_id);
CREATE INDEX IF NOT EXISTS idx_checkins_paciente_data ON checkins(paciente_id, data);

-- ---------------------------------------------------------------------
-- Gatilho: atualiza pacientes.atualizado_em automaticamente
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION atualizar_coluna_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pacientes_atualizado_em ON pacientes;
CREATE TRIGGER trg_pacientes_atualizado_em
  BEFORE UPDATE ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_coluna_atualizado_em();
