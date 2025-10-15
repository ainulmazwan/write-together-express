const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Vote = require("../models/vote");
const Story = require("../models/story");
const Chapter = require("../models/chapter");

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
      favourites: newUser.favourites,
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
      favourites: user.favourites,
    },
    process.env.JWT_SECRET,
    { expiresIn: 60 * 60 }
  );

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    favourites: user.favourites,
    token: token,
  };
};

// READ
// get user by id
const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// get favourited stories
const getFavouritedStories = async (userId) => {
  const user = await User.findById(userId)
    .populate("favourites")
    .populate({
      path: "favourites",
      select: "title author status genre createdAt views",
      // populate name of author inside of story
      populate: [
        {
          path: "author",
          model: "User",
          select: "name",
        },
        {
          path: "genre",
          model: "Genre",
          select: "name",
        },
      ],
    });

  if (!user) {
    throw new Error();
  }

  return user.favourites;
};

// get all users (admin only)
const getUsers = async () => {
  const users = await User.find({
    role: { $ne: "system" }, // role !== "system" // system is deleted user
  });
  return users;
};

// UPDATE
// add to favourites
const addToFavourites = async (userId, storyId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const alreadyAdded = user.favourites.includes(storyId);
  // check if already added to favourites
  if (!alreadyAdded) {
    user.favourites.push(storyId);
  }

  await user.save();
  return user;
};

// remove from favourites
const removeFromFavourites = async (userId, storyId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.favourites = user.favourites.filter((fav) => fav.toString() !== storyId);

  await user.save();
  return user;
};

// admin & account owner can use this function
const updateUser = async (userId, updates) => {
  if (updates.password) {
    updates.password = bcrypt.hashSync(updates.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
  });

  return updatedUser;
};

// DELETE
// ADMIN ONLY
// delete user
const deleteUser = async (userId) => {
  // remove user's votes
  await Vote.deleteMany({ user: userId });

  // unlink user's stories and chapters
  await Story.updateMany(
    { author: userId },
    { $set: { author: process.env.DELETED_USER_ID } } // deleted user
  );
  await Chapter.updateMany(
    { author: userId },
    { $set: { author: process.env.DELETED_USER_ID } }
  );

  // remove user account
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new Error("User not found");
  }

  return deletedUser;
};

module.exports = {
  signup,
  login,
  getUserByEmail,
  getUserById,
  addToFavourites,
  removeFromFavourites,
  getFavouritedStories,
  deleteUser,
  getUsers,
  updateUser,
};
