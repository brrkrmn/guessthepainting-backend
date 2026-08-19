const express = require('express');
const app = express();
const cors = require('cors');
const paintingsRouter = require('./controllers/paintings');
const searchRouter = require("./controllers/search");
const middleware = require("./utils/middleware");
const { databaseConnection } = require("./utils/db");

require("express-async-errors");
require("./utils/cronJobs");

app.use(cors());
app.use(express.json());

app.use(middleware.requestLogger);

app.get("/", (req, res) => res.send("Express on Vercel"));
app.use("/api/paintings", databaseConnection, paintingsRouter);
app.use("/api/search", databaseConnection, searchRouter);

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app