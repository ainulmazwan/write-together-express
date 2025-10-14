const Chapter = require("../models/chapter");
const Story = require("../models/story");
const Vote = require("../models/vote");

// CREATE
const addChapter = async (storyId, content, author, isOfficial) => {
  // check if user has added a submission before (if this is not chapter 1)
  const story = await Story.findById(storyId);
  if (
    !isOfficial && // isOfficial = false : this is a submission
    story.currentRound.submissions.length > 0 // if there are no existing submissions yet, no need to do check
  ) {
    // find submissison (!isOfficial) with same story and author, same chapterNumber as current round
    const existingSubmissions = await Chapter.find({
      story: storyId,
      author: author,
      isOfficial: false,
      chapterNumber: story.currentRound.chapterNumber,
    });

    if (existingSubmissions.length > 0) {
      throw new Error("You have already submitted a chapter for this round.");
    }
  }

  const newChapter = new Chapter({
    story,
    content,
    author,
    isOfficial,
    chapterNumber: story.currentRound.chapterNumber,
  });

  await newChapter.save();
  return newChapter;
};

// READ
// get a specific chapter
const getChapter = async (id) => {
  const chapter = await Chapter.findById(id)
    .populate("story", "title") // get story title
    .populate("author", "name"); // get author name

  if (!chapter) {
    throw new Error("Chapter not found");
  }
  return chapter;
};

// get all chapters by a specific user
const getChaptersByAuthor = async (authorId) => {
  const chapters = await Chapter.find({ author: authorId }).populate({
    path: "story",
    select: "title author",
    // populate name of author inside of story
    populate: {
      path: "author",
      model: "User",
      select: "name",
    },
  });
  return chapters;
};

// get all submissions in a round in a story (omg why do i do this)
const getSubmissionsForCurrentRound = async (storyId) => {
  // get story
  const story = await Story.findById(storyId).populate({
    // get submission id from submissions array in story
    // then populate with data
    path: "currentRound.submissions",
    populate: { path: "author", select: "name" },
  });

  return story.currentRound.submissions;
};

// UPDATE
// update chapter
const updateChapter = async (id, updates) => {
  const chapter = await Chapter.findByIdAndUpdate(id, updates, { new: true });
  if (!chapter) {
    throw new Error("Chapter not found");
  }
  return chapter;
};

// DELETE
// delete chapter
const deleteChapter = async (id) => {
  const chapter = await Chapter.findById(id);
  if (!chapter) {
    throw new Error("Chapter not found");
  }

  // update connected stories' chapters array to have deleted chapter id instead
  await Story.updateMany(
    { chapters: id }, // find story with chapters array that has this id
    { $set: { "chapters.$": process.env.DELETED_CHAPTER_ID } } // chapters.$ = position of element that has this id
  );

  // path strings need quotes - ie. "currentRound.submissions":

  // update connected stories' submissions array if chapter is a submission
  await Story.updateMany(
    { "currentRound.submissions": id },
    { $pull: { "currentRound.submissions": id } } // $pull = removes from array the element that matches requirements
  );

  // delete votes related to this chapter
  await Vote.deleteMany({ chapter: id });

  return await Chapter.findByIdAndDelete(id);
};

module.exports = {
  addChapter,
  getChapter,
  getChaptersByAuthor,
  getSubmissionsForCurrentRound,
  updateChapter,
  deleteChapter,
};
