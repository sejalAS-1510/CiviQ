const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// connect database
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("CiviQ backend running successfully");
});

// complaint API
app.use("/api/complaints", complaintRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
