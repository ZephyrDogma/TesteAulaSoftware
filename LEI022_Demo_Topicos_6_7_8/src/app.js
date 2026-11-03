const express = require("express");
const cors = require("cors");
const students = require("./routes/students");
const courses = require("./routes/courses");
const enrolments = require("./routes/enrolments");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/students", students);
app.use("/api/courses", courses);
app.use("/api/enrolments", enrolments);

app.use((req, res) => res.status(404).json({
  error: { code: "ROUTE_NOT_FOUND", message: "Endpoint não encontrado." }
}));
app.use(errorHandler);
module.exports = app;
