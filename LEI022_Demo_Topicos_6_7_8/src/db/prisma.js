const { PrismaClient } = require("@prisma/client");
const { getDatabaseUrl } = require("../config/env");

const prisma = new PrismaClient({
  datasources: { db: { url: getDatabaseUrl() } },
  log: process.env.SQL_LOG === "true" ? ["query", "warn", "error"] : ["error"]
});

module.exports = prisma;
