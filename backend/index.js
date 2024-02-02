// backend/index.js
const express = require('express');
const cors = require("cors");
require('dotenv').config();
const rootRouter = require("./routes/index");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", rootRouter);

app.listen(3000);