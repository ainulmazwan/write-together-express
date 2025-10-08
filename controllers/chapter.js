const Chapter = require("../models/chapter");
const Story = require("../models/story");

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
      chapterNumber: story.currentRound.chapterNumber
    });

    if (existingSubmissions.length > 0) {
      throw new Error("You have already submitted a chapter for this round.");
    }
  }

  // count how many official chapters in the story
  const existingCount = await Chapter.countDocuments({
    story,
    isOfficial: true,
  });

  const newChapter = new Chapter({
    story,
    content,
    author,
    isOfficial,
    chapterNumber: existingCount + 1,
  });

  await newChapter.save();
  return newChapter;
};

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
  const chapters = await Chapter.find({ author: authorId })
    .populate("story", "title")
    .populate("author", "name");
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

module.exports = {
  addChapter,
  getChapter,
  getChaptersByAuthor,
  getSubmissionsForCurrentRound,
};
