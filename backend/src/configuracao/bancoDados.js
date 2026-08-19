const { Pool } = require("pg");
const variaveisAmbiente = require("./variaveisAmbiente");

const pool = new Pool({
  connectionString: variaveisAmbiente.urlBancoDados,
  ssl: variaveisAmbiente.ambiente === "producao" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (erro) => {
  console.error("Erro inesperado no pool do banco de dados:", erro);
});

module.exports = pool;
