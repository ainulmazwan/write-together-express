const express = require("express");
const router = express.Router();

const { addStory } = require("../controllers/story");
const { addChapter } = require("../controllers/chapter");

// add story
router.post("/add", async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const genre = req.body.genre;
    const author = req.body.author;
    const publishDate = req.body.publishDate;
    const votingWindow = req.body.votingWindow;
    const deadline = req.body.deadline;
    const chapterContent = req.body.chapterContent;

    const story = await addStory(
      title,
      description,
      genre,
      author,
      publishDate,
      votingWindow,
      deadline,
      [] // empty chapters for now
    );

    // create first chapter
    const chapter1 = await addChapter(story._id, chapterContent, author, true);

    // now add chapter to array
    story.chapters.push(chapter1._id);
    await story.save();

    res.status(200).send(story);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
