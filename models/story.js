const { Schema, model } = require("mongoose");

const storySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: "Genre",
      required: true,
    },
    // takes author (User) id
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publishDate: {
      type: Date,
      required: true,
    },
    votingWindow: {
      type: Number,
      required: true,
    },
    // object
    currentRound: {
      chapterNumber: { type: Number, required: true },
      submissions: [
        { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
      ],
      startDate: { type: Date, required: true },
      deadline: { type: Date },
    },
    // array, takes chapter id
    chapters: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
    status: {
      type: String,
      enum: ["ongoing", "hiatus", "completed"],
      default: "ongoing",
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Story = model("Story", storySchema);
module.exports = Story;
