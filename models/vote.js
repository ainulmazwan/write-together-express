const { Schema, model } = require("mongoose");

const voteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  story: {
    type: Schema.Types.ObjectId,
    ref: "Story",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Vote = model("Vote", voteSchema);
module.exports = Vote;
