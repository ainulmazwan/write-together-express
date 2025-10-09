const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getUserById,
  addToFavourites,
  removeFromFavourites,
  getFavouritedStories,
  getUsers,
  updateUser,
  deleteUser
} = require("../controllers/user");
const { isAdmin, isValidUser } = require("../middleware/auth");
// signup
router.post("/signup", async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const user = await signup(name, email, password);
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await login(email, password);
    res.status(200).send(user);
  } catch (error) {
    console.log("error");
    res.status(400).send({ message: error.message });
  }
});

// get user by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await getUserById(id);
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// add to favourites
router.post("/:id/favourites/:storyId", async (req, res) => {
  try {
    const { id, storyId } = req.params;
    const user = await addToFavourites(id, storyId);

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// remove from favourites
router.delete("/:id/favourites/:storyId", async (req, res) => {
  try {
    const { id, storyId } = req.params;
    const user = await removeFromFavourites(id, storyId);
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error.message);
  }
});

// get favourited stories
router.get("/:id/favourites", async (req, res) => {
  try {
    const { id } = req.params;
    const favourites = await getFavouritedStories(id);
    res.status(200).send(favourites);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// get ALL users
router.get("/", isAdmin, async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/:id", isValidUser, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    if (req.user.role !== "admin" && updates.role) {
      // cannot change role if current user is not admin
      delete updates.role;
    }
    const updatedUser = await updateUser(id, updates);
    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const deletedUser = await deleteUser(id);
    res.status(200).send(deletedUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
