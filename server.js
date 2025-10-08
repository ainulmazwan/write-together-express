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

app.get("/", (req, res) => {
  res.send("Testing");
});

// import routers
app.use("/users", require("./routes/user"));
app.use("/stories", require("./routes/story"));
app.use("/genres", require("./routes/genre"));
app.use("/chapters", require("./routes/chapter"));
app.use("/votes", require("./routes/vote"));

app.listen(5123, () => {
  console.log("server is running at http://localhost:5123");
});
