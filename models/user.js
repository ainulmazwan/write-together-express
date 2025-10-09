const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "system"],
    default: "user",
  },
  favourites: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Story",
      },
    ],
    default: [],
  },
});

const User = model("User", userSchema);
module.exports = User;
