/*
 * Comparação didática: acesso direto com pg (sem ORM).
 * Executar separadamente depois de instalar pg:
 *   npm install pg
 *   node examples/raw-pg-comparison.js
 *
 * O exemplo usa parâmetros $1/$2 para evitar SQL injection.
 */
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createStudent(name, email) {
  const result = await pool.query(
    `INSERT INTO students (name, email, "updatedAt")
     VALUES ($1, $2, NOW())
     RETURNING id, name, email, version, "createdAt"`,
    [name, email]
  );
  return result.rows[0];
}

async function listStudentsWithEnrolments() {
  // Uma consulta SQL explícita com JOIN.
  const result = await pool.query(`
    SELECT s.id, s.name, s.email,
           e.id AS enrolment_id, c.code AS course_code, c.name AS course_name
    FROM students s
    LEFT JOIN enrolments e ON e."studentId" = s.id
    LEFT JOIN courses c ON c.id = e."courseId"
    ORDER BY s.id, c.code
  `);
  return result.rows;
}

async function createEnrolment(studentId, courseId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const student = await client.query("SELECT id FROM students WHERE id = $1", [studentId]);
    const course = await client.query("SELECT id FROM courses WHERE id = $1", [courseId]);
    if (!student.rowCount || !course.rowCount) throw new Error("Estudante/UC inexistente");
    const created = await client.query(
      `INSERT INTO enrolments ("studentId", "courseId")
       VALUES ($1, $2) RETURNING *`,
      [studentId, courseId]
    );
    await client.query("COMMIT");
    return created.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { createStudent, listStudentsWithEnrolments, createEnrolment };
