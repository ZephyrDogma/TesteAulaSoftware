const { Prisma } = require("@prisma/client");
const AppError = require("../errors/AppError");

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }

  // Erros conhecidos do Prisma são traduzidos para o contrato HTTP.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: { code: "RESOURCE_CONFLICT", message: "Já existe um registo com um valor único igual." }
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "O recurso indicado não existe." }
      });
    }
    if (err.code === "P2003") {
      return res.status(409).json({
        error: { code: "REFERENCE_CONFLICT", message: "A operação viola uma relação de integridade." }
      });
    }
  }

  // Não expor stack traces, SQL, credenciais ou detalhes internos ao cliente.
  console.error(err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Ocorreu um erro interno." }
  });
}
module.exports = errorHandler;
