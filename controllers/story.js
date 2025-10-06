const jwt = require("jsonwebtoken");

const Story = require("../models/story");

// add story
const addStory = async (
  title,
  description,
  genre,
  author,
  publishDate,
  votingWindow,
  deadline,
  chapters = []
) => {
  const newStory = new Story({
    title,
    description,
    genre,
    author,
    publishDate,
    votingWindow,
    currentRound: {
      chapterNumber: 2,
      submissions: [],
      startDate: publishDate,
      deadline,
    },
    chapters,
  });

  await newStory.save();
  return newStory;
};

module.exports = {
  addStory,
};
