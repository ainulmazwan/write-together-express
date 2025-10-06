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
  chapter1
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
    chapters: [chapter1],
  });

  await newStory.save();
  return { newStory };
};
