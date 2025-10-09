const express = require("express");
const router = express.Router();

const {
  addGenre,
  getGenres,
  editGenre,
  deleteGenre,
} = require("../controllers/genre");

// add genre
router.post("/", async (req, res) => {
  try {
    const name = req.body.name;

    const genre = await addGenre(name);

    res.status(200).send(genre);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
});

// get genres
router.get("/", async (req, res) => {
  try {
    const genres = await getGenres();
    res.status(200).send(genres);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// edit genre
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const genre = await editGenre(id, name);
    res.status(200).send(genre);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const genre = await deleteGenre(id);
    res.status(200).send("Genre deleted successfully");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
