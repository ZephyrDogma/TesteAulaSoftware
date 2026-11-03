const prisma = require("../db/prisma");

async function listCourses() {
  return prisma.course.findMany({ orderBy: { code: "asc" } });
}
async function createCourse(data) {
  return prisma.course.create({ data });
}
module.exports = { listCourses, createCourse };
