const { Schema, model } = require("mongoose");

const chapterSchema = new Schema(
  {
    story: {
      type: Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isOfficial: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Chapter = model("Chapter", chapterSchema);
module.exports = Chapter;
