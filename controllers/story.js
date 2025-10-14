const Story = require("../models/story");
const Chapter = require("../models/chapter");
const Vote = require("../models/vote");
const User = require("../models/user");

// CREATE
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

// READ
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
const getStories = async (genreId, status, search, sortBy) => {
  const filters = {};

  // show only published stories
  // publishdate in the past or now
  const now = new Date();
  filters.publishDate = { $lte: now };
  if (genreId) {
    filters.genre = genreId;
  }
  if (status) {
    filters.status = status;
  }

  if (search && search !== "") {
    const regex = new RegExp(search, "i"); // i = case insensitive
    filters.$or = [{ title: { $regex: regex } }];
  }

  // dont include deleted story
  filters._id = { $ne: process.env.DELETED_STORY_ID };

  // prepare query
  let query = Story.find(filters)
    .populate("author", "name")
    .populate("genre", "name");

  if (sortBy === "newest") {
    query.sort({ createdAt: -1 }); // newest first (date in descending order)
  } else if (sortBy === "alphabetical") {
    query = query.sort({ title: 1 }).collation({ locale: "en", strength: 2 });
    // sort using english rules, strength:2 means ignore case sensitivity (ie. A = a)
  } else if (sortBy === "popular") {
    query = query.sort({ views: -1 }); // descending
  }

  // execute query
  const stories = await query;
  return stories;
};

// UPDATE
// update story
const updateStory = async (id, updates) => {
  const updatedStory = await Story.findByIdAndUpdate(
    id,
    { $set: updates }, // updates is an object ie. {title: newTitle}
    { new: true, runValidators: true }
  );

  if (!updatedStory) {
    throw new Error("Story not found");
  }

  return updatedStory;
};

// advance the current round (called when deadline is past)
const advanceRound = async (storyId) => {
  const story = await Story.findById(storyId).populate(
    "currentRound.submissions"
  );
  if (!story) throw new Error("Story not found");

  // check if deadline hasnt passed yet
  const now = new Date();
  if (now < new Date(story.currentRound.deadline)) {
    return story;
  }

  const submissions = story.currentRound.submissions;

  if (submissions.length > 0) {
    // find submission with highest votes
    const votesCount = await Promise.all(
      // submissions.map(async()=>{}) returns an array of promises
      submissions.map(async (sub) => {
        const count = await Vote.countDocuments({ chapter: sub._id }); // count votes per sub
        return { submission: sub, count }; // ie. { submission: [subId], 3}
      })
    );

    const sortedVotesCount = votesCount.sort((a, b) => b.count - a.count); // descending
    const winner = sortedVotesCount[0]?.submission; // get the first item (highest votes)

    if (winner) {
      // set winner as official chapter
      winner.isOfficial = true;
      await winner.save();
      story.chapters.push(winner._id);
      // only increase chapterNumber if winner is selected
      story.currentRound.chapterNumber += 1;
    }

    // reset submissions array
    story.currentRound.submissions = [];
  } else {
    // if no submissions
    story.status = "hiatus";
  }

  // start date of new round
  const prevDeadline = new Date(story.currentRound.deadline);
  story.currentRound.startDate = prevDeadline;

  // update deadline, even the ones on hiatus (in case they want to resume)
  story.currentRound.deadline = new Date(
    new Date(story.currentRound.deadline).getTime() +
      story.votingWindow * 24 * 60 * 60 * 1000
  );

  // delete all votes from this round
  await Vote.deleteMany({ story: story._id });

  await story.save();
  return story;
};

const endStory = async (storyId) => {
  const story = await Story.findById(storyId);

  if (!story) {
    throw new Error("Story not found");
  }

  story.status = "completed";
  story.currentRound.deadline = new Date();

  await story.save();

  return story;
};

const resumeStory = async (id) => {
  const story = await Story.findById(id);

  if (!story) {
    throw new Error("Story not found");
  }
  if (story.status !== "hiatus") {
    throw new Error("Story is not on hiatus");
  }

  story.status = "ongoing";

  // update currentRound’s timing
  const votingWindow = story.votingWindow * 24 * 60 * 60 * 1000;

  const startDate = new Date(story.currentRound.startDate);

  story.currentRound.deadline = new Date(startDate.getTime() + votingWindow);

  await story.save();
  return story;
};

// increment views
const incrementViews = async (id) => {
  const story = await Story.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );
  return story;
};


// DELETE
// delete story
const deleteStory = async (id) => {
  await Chapter.updateMany(
    { story: id },
    { $set: { story: process.env.DELETED_STORY_ID } }
  );

  await User.updateMany({ favourites: id }, { $pull: { favourites: id } });

  const story = await Story.findByIdAndDelete(id);
  if (!story) {
    throw new Error("Story not found");
  }

  return story;
};

module.exports = {
  addStory,
  getStoryById,
  getStoriesByAuthor,
  getStories,
  updateStory,
  advanceRound,
  deleteStory,
  endStory,
  resumeStory,
  incrementViews,
};
