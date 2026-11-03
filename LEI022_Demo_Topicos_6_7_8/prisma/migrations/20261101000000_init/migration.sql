CREATE TABLE "students" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

CREATE TABLE "courses" (
  "id" SERIAL NOT NULL,
  "code" VARCHAR(12) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "ects" INTEGER NOT NULL,
  CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

CREATE TABLE "enrolments" (
  "id" SERIAL NOT NULL,
  "studentId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "grade" DOUBLE PRECISION,
  CONSTRAINT "enrolments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "enrolments_studentId_courseId_key" ON "enrolments"("studentId", "courseId");
CREATE INDEX "enrolments_studentId_idx" ON "enrolments"("studentId");
CREATE INDEX "enrolments_courseId_idx" ON "enrolments"("courseId");

ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
