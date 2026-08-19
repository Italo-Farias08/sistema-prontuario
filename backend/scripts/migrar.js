// Aplica o esquema (banco/esquema.sql) no banco apontado por DATABASE_URL.
// Use --com-exemplos para também inserir os dados de exemplo.
//
// Uso:
//   npm run migrar
//   npm run migrar -- --com-exemplos

const fs = require("fs");
const path = require("path");
const bancoDados = require("../src/configuracao/bancoDados");

async function executarArquivoSql(caminhoRelativo) {
  const caminhoCompleto = path.join(__dirname, "..", caminhoRelativo);
  const sql = fs.readFileSync(caminhoCompleto, "utf8");
  console.log(`Executando ${caminhoRelativo}...`);
  await bancoDados.query(sql);
  console.log(`OK: ${caminhoRelativo}`);
}

async function main() {
  const incluirExemplos = process.argv.includes("--com-exemplos");

  try {
    await executarArquivoSql("banco/esquema.sql");

    if (incluirExemplos) {
      await executarArquivoSql("banco/dados_exemplo.sql");
    }

    console.log("Migração concluída com sucesso.");
  } catch (erro) {
    console.error("Falha na migração:", erro);
    process.exitCode = 1;
  } finally {
    await bancoDados.end();
  }
}

main();
