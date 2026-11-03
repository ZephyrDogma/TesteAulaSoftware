const { z } = require("zod");

const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255)
}).strict();

const updateStudentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  version: z.number().int().positive()
}).strict();

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

module.exports = { createStudentSchema, updateStudentSchema, idParamSchema };
