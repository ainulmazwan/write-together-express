const Vote = require("../models/vote");

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

const addVote = async (userId, chapterId, storyId) => {
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
