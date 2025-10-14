// prepare environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors());

async function connectToMongoDB() {
  try {
    // wait for the MongoDB to connect
    await mongoose.connect("mongodb://localhost:27017/writetogether");
    console.log("MongoDB is Connected");
  } catch (error) {
    console.log(error);
  }
}

connectToMongoDB();

app.get("/api", (req, res) => {
  res.send("Testing");
});

// import routers
app.use("/api/users", require("./routes/user"));
app.use("/api/stories", require("./routes/story"));
app.use("/api/genres", require("./routes/genre"));
app.use("/api/chapters", require("./routes/chapter"));
app.use("/api/votes", require("./routes/vote"));

app.listen(5123, () => {
  console.log("server is running at http://localhost:5123");
});
