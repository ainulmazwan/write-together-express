const Chapter = require("../models/chapter");

const addChapter = async (story, content, author, isOfficial) => {
  const newChapter = new Chapter({
    story,
    content,
    author,
    isOfficial
  });

  await newChapter.save();
  return newChapter;
};

module.exports = {
  addChapter
};