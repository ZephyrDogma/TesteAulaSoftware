const express = require("express");
const validate = require("../middleware/validate");
const { createCourseSchema } = require("../schemas/courseSchemas");
const service = require("../services/courseService");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try { res.json(await service.listCourses()); } catch (e) { next(e); }
});
router.post("/", validate(createCourseSchema), async (req, res, next) => {
  try {
    const course = await service.createCourse(req.body);
    res.status(201).location(`/api/courses/${course.id}`).json(course);
  } catch (e) { next(e); }
});
module.exports = router;
