const { z } = require("zod");
const createEnrolmentSchema = z.object({
  studentId: z.number().int().positive(),
  courseId: z.number().int().positive()
}).strict();
const gradeSchema = z.object({
  grade: z.number().min(0).max(20)
}).strict();
module.exports = { createEnrolmentSchema, gradeSchema };
