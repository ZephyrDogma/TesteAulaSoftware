const dotenv = require("dotenv");
dotenv.config();

function getDatabaseUrl() {
  if (process.env.NODE_ENV === "test") {
    if (!process.env.DATABASE_URL_TEST) {
      throw new Error("DATABASE_URL_TEST é obrigatória em ambiente de testes.");
    }
    return process.env.DATABASE_URL_TEST;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está configurada.");
  }
  return process.env.DATABASE_URL;
}

module.exports = { getDatabaseUrl };
