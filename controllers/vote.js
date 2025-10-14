const Vote = require("../models/vote");
const Story = require("../models/story");

//CREATE
const addVote = async (userId, chapterId, storyId) => {
  const story = await Story.findById(storyId);

  // check if story deadline has passed
  const now = new Date();
  const deadline = new Date(story.currentRound.deadline);
  if (now > deadline) {
    throw new Error("Voting period has ended for this round.");
  }

  // check if user already voted for this story/round
  const existingVote = await Vote.findOne({ user: userId, story: storyId });
  if (existingVote) {
    throw new Error("User has already voted in this story round.");
  }

  const vote = new Vote({
    user: userId,
    chapter: chapterId,
    story: storyId,
  });

  await vote.save();
  return vote;
};


// READ
const getVote = async (userId, storyId) => {
  const vote = await Vote.findOne({
    user: userId,
    story: storyId,
  });
  return vote;
};

const getVotesForSubmission = async (submissionId) => {
  const votes = await Vote.find({
    chapter: submissionId,
  });

  return votes;
};


// DELETE
const removeVote = async (userId, chapterId) => {
  const vote = await Vote.findOneAndDelete({
    user: userId,
    chapter: chapterId,
  });

  if (!vote) {
    throw new Error("Vote not found");
  }
  return vote;
};

module.exports = {
  getVote,
  getVotesForSubmission,
  addVote,
  removeVote,
};
