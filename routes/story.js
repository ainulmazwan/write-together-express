const express = require("express");
const router = express.Router();

const {
  addStory,
  getStoriesByAuthor,
  getStoryById,
  getStories,
  updateStory,
  advanceRound,
  deleteStory,
  endStory,
  resumeStory,
} = require("../controllers/story");
const { addChapter } = require("../controllers/chapter");
const { isValidUser } = require("../middleware/auth");

// add story
router.post("/", isValidUser, async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      author,
      publishDate,
      votingWindow,
      deadline,
      chapterContent,
    } = req.body;

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

// get a specific story
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const story = await getStoryById(id);

    res.status(200).send(story);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// get stories by author (for profile view / logged in users)
router.get("/author/:authorId", isValidUser, async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const stories = await getStoriesByAuthor(authorId);

    res.status(200).send(stories);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// get ALL stories
router.get("/", async (req, res) => {
  try {
    const { genre, status, search } = req.query;
    const stories = await getStories(genre, status, search);
    res.status(200).send(stories);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// advance a story (ie. when deadline is past, add official chapter)
router.put("/advance/:storyId", async (req, res) => {
  try {
    const storyId = req.params.storyId;

    const advancedStory = await advanceRound(storyId);

    res.status(200).send(advancedStory);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// update a story
router.put("/:id", isValidUser, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const story = await updateStory(id, updates);
    res.status(200).send(story);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// delete story
router.delete("/:id", isValidUser, async (req, res) => {
  try {
    const id = req.params.id;
    const story = await deleteStory(id);
    res.status(200).send(story);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// end story
router.put("/:id/end", isValidUser, async (req, res) => {
  try {
    const id = req.params.id;
    const story = await endStory(id);
    res.status(200).send(story);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// resume story
router.put("/:id/resume", isValidUser, async (req, res) => {
  try {
    const id = req.params.id;
    const story = await resumeStory(id);
    res.status(200).send(story);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
