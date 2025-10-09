const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getUserById,
  addToFavourites,
  removeFromFavourites,
  getFavouritedStories,
} = require("../controllers/user");

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

module.exports = router;
