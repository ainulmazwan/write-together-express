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

// get a specific story
const getStoryById = async (id) => {
  const story = await Story.findById(id)
    .populate("author", "name")
    // populate chapter author's name + all chapter fields
    .populate({
      path: "currentRound.submissions",
      populate: {
        path: "author",
        select: "name",
      },
    })
    .populate({
      path: "chapters",
      populate: { path: "author", select: "name" },
    })
    .populate("genre");
  if (!story) {
    throw new Error("Story not found");
  }
  return story;
};

// get stories by author id
const getStoriesByAuthor = async (authorId) => {
  const stories = await Story.find({ author: authorId }).populate(
    "author",
    "name"
  );

  return stories;
};

// get ALL published stories (with filtering, sorting)
const getStories = async (genreId, sortBy) => {
  const filters = {};

  if (genreId && genreId !== "all") {
    filters.genre = genreId;
  }

  // show only published stories
  // publishdate in the past or now
  const now = new Date();
  filters.publishDate = { $lte: now };

  // prepare query
  let query = Story.find(filters).populate("author", "name");

  // handle sorting
  if (sortBy === "alphabetical") {
    query = query.sort({ title: 1 }); // ascending by title
  } else if (sortBy === "newest") {
    query = query.sort({ createdAt: -1 }); // newest first
  }

  // execute query
  const stories = await query;
  return stories;
};

module.exports = {
  addStory,
  getStoryById,
  getStoriesByAuthor,
  getStories,
};
