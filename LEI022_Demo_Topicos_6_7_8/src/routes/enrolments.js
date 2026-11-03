const express = require("express");
const validate = require("../middleware/validate");
const { createEnrolmentSchema, gradeSchema } = require("../schemas/enrolmentSchemas");
const service = require("../services/enrolmentService");
const { z } = require("zod");
const router = express.Router();
const idSchema = z.object({ id: z.coerce.number().int().positive() });

router.post("/", validate(createEnrolmentSchema), async (req, res, next) => {
  try {
    const item = await service.createEnrolment(req.body);
    res.status(201).location(`/api/enrolments/${item.id}`).json(item);
  } catch (e) { next(e); }
});
router.patch("/:id/grade", validate(idSchema, "params"), validate(gradeSchema), async (req, res, next) => {
  try { res.json(await service.setGrade(req.params.id, req.body.grade)); } catch (e) { next(e); }
});
module.exports = router;
