const { z } = require("zod");
const createCourseSchema = z.object({
  code: z.string().trim().min(2).max(12).regex(/^[A-Z0-9-]+$/),
  name: z.string().trim().min(2).max(120),
  ects: z.number().int().min(1).max(60)
}).strict();
module.exports = { createCourseSchema };
