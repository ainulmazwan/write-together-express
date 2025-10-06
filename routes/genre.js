const express = require("express");
const router = express.Router();

const { addGenre } = require("../controllers/genre");

// add story
router.post("/add", async (req, res) => {
  try {
    const name = req.body.name;

    const genre = await addGenre(name);

    res.status(200).send(genre);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
