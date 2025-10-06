const Genre = require("../models/genre");

const addGenre = async (name) => {
  const newGenre = new Genre({
    name,
  });

  await newGenre.save();
  return newGenre;
};

module.exports = {
  addGenre,
};
