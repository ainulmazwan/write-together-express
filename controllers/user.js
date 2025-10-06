const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const getUserByEmail = async (email) => {
  return await User.findOne({ email: email });
};

// signup
const signup = async (name, email, password) => {
  const emailExists = await getUserByEmail(email);
  if (emailExists) {
    throw new Error(
      "Email already exists. Please use another email or log in with existing email"
    );
  }

  const newUser = new User({
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 10), // hash the password
  });

  await newUser.save();

  let token = jwt.sign(
    {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    process.env.JWT_SECRET, // secret
    { expiresIn: 60 * 60 }
  );

  // 5 return the user data
  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    favourites: newUser.favourites,
    token: token,
  };
};

// login
const login = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  let token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: 60 * 60 }
  );

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: token,
  };
};

module.exports = {
  signup,
  login,
};
