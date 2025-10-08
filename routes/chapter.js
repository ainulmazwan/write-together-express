const express = require("express");
const router = express.Router();

const {
  getChapter,
  getChaptersByAuthor,
  getSubmissionsForCurrentRound,
  addChapter,
} = require("../controllers/chapter");
const { getStoryById } = require("../controllers/story");

// add submission/chapter
router.post("/", async (req, res) => {
  try {
    const storyId = req.body.storyId;
    const content = req.body.content;
    const authorId = req.body.authorId;
    const isOfficial = false;

    const chapter = await addChapter(storyId, content, authorId, isOfficial);

    // update submissions array in story
    const story = await getStoryById(storyId);
    console.log(story);
    story.currentRound.submissions.push(chapter._id);
    await story.save();

    res.status(200).send(chapter);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// get a specific chapter
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const chapter = await getChapter(id);
    res.status(200).send(chapter);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// get all chapters by a user
router.get("/author/:authorId", async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const chapters = await getChaptersByAuthor(authorId);
    res.status(200).send(chapters);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// get submissions in current round
router.get("/story/:storyId", async (req, res) => {
  try {
    const storyId = req.params.storyId;
    const submissions = await getSubmissionsForCurrentRound(storyId);
    res.status(200).send(submissions);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
