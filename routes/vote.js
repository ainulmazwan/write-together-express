const express = require("express");
const router = express.Router();

const {
  getVote,
  getVotesForSubmission,
  addVote,
  removeVote,
} = require("../controllers/vote");

// get a specific vote for a specific story by a specific user (omg)
router.get("/user/:userId/story/:storyId", async (req, res) => {
  try {
    const { userId, storyId } = req.params;
    const vote = await getVote(userId, storyId);
    console.log(vote);
    res.status(200).send(vote);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// get all votes for submission
router.get("/chapter/:submissionId", async (req, res) => {
  try {
    const submissionId = req.params.submissionId;

    const votes = await getVotesForSubmission(submissionId);

    res.status(200).send(votes);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, chapterId, storyId } = req.body;

    const vote = await addVote(userId, chapterId, storyId);

    res.status(200).send(vote);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { userId, chapterId } = req.body;
    const vote = await removeVote(userId, chapterId);

    res.status(200).json({ message: "Vote removed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
