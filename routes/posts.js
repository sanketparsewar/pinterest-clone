const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  postcaption: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the current date and time
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the 'User' model
  },
  likes: {
    type: Array,
    default: [], // Initializes the likes count to 0
  },
});

module.exports = mongoose.model("Post", PostSchema);
