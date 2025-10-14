const Genre = require("../models/genre");
const Story = require("../models/story");

// CREATE
const addGenre = async (name) => {
  const newGenre = new Genre({
    name,
  });

  await newGenre.save();
  return newGenre;
};

// READ
const getGenres = async () => {
  const genres = await Genre.find();
  return genres;
};

// UPDATE
const editGenre = async (id, name) => {
  const genre = await Genre.findByIdAndUpdate(id, {
    name: name,
  });
  return genre;
};

// DELETE
const deleteGenre = async (id) => {
  // check if any stories use this genre
  const storiesWithGenre = await Story.find({ genre: id });

  if (storiesWithGenre.length > 0) {
    throw new Error(
      "Cannot delete genre — it is currently used by one or more stories."
    );
  }

  // If no stories use it, delete safely
  const deletedGenre = await Genre.findByIdAndDelete(id);
  return deletedGenre;
};

module.exports = {
  addGenre,
  getGenres,
  editGenre,
  deleteGenre,
};
