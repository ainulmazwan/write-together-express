const jwt = require("jsonwebtoken");

const { getUserByEmail } = require("../controllers/user");

const isValidUser = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const token = authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserByEmail(decoded.email);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(400).send({ error: "YOU SHALL NOT PASS" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "YOU SHALL NOT PASS" });
  }
};

// check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const token = authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserByEmail(decoded.email);
    if (user && user.role === "admin") {
      req.user = user;
      next();
    } else {
      res.status(400).send({ error: "YOU SHALL NOT PASS" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "YOU SHALL NOT PASS" });
  }
};

module.exports = {
  isValidUser,
  isAdmin,
};
