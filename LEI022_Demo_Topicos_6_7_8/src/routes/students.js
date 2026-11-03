const express = require("express");
const validate = require("../middleware/validate");
const { createStudentSchema, updateStudentSchema, idParamSchema } = require("../schemas/studentSchemas");
const service = require("../services/studentService");
const AppError = require("../errors/AppError");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const name = typeof req.query.name === "string" ? req.query.name : undefined;
    const includeEnrolments = req.query.include === "enrolments";
    res.json(await service.listStudents({ name, includeEnrolments }));
  } catch (e) { next(e); }
});

router.get("/:id", validate(idParamSchema, "params"), async (req, res, next) => {
  try { res.json(await service.getStudent(req.params.id)); } catch (e) { next(e); }
});

router.post("/", validate(createStudentSchema), async (req, res, next) => {
  try {
    const student = await service.createStudent(req.body);
    res.status(201).location(`/api/students/${student.id}`).json(student);
  } catch (e) { next(e); }
});

router.put("/:id", validate(idParamSchema, "params"), validate(updateStudentSchema), async (req, res, next) => {
  try { res.json(await service.updateStudent(req.params.id, req.body)); } catch (e) { next(e); }
});

router.delete("/:id", validate(idParamSchema, "params"), async (req, res, next) => {
  try { await service.deleteStudent(req.params.id); res.status(204).end(); } catch (e) { next(e); }
});

module.exports = router;
