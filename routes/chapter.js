const express = require("express");
const router = express.Router();

const {
  getChapter,
  getChaptersByAuthor,
  getSubmissionsForCurrentRound,
  addChapter,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapter");
const { getStoryById } = require("../controllers/story");
const { isValidUser } = require("../middleware/auth");

// add submission/chapter
router.post("/", isValidUser, async (req, res) => {
  try {
    const storyId = req.body.storyId;
    const content = req.body.content;
    const authorId = req.body.authorId;
    const isOfficial = false;

    const chapter = await addChapter(storyId, content, authorId, isOfficial);

    // update submissions array in story
    const story = await getStoryById(storyId);
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

// get all chapters by a user (for profile view)
router.get("/author/:authorId", isValidUser, async (req, res) => {
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

// update chapter
router.put("/:id", isValidUser, async (req, res) => {
  try {
    const chapterId = req.params.id;
    const updates = req.body;
    const updatedChapter = await updateChapter(chapterId, updates);
    res.status(200).send(updatedChapter);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// delete chapter
router.delete("/:id", isValidUser, async (req, res) => {
  try {
    const chapterId = req.params.id;
    await deleteChapter(chapterId);
    res.status(200).send({ message: "Chapter has been deleted" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
