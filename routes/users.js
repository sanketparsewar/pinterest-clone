const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",   // Reference to the 'Post' model
    },
  ],
  dp: {
    type: String,
    default: "profile_user.jpg", // Default profile picture
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  likedposts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    }
  ]
});

// the use of a plugin in Mongoose to extend or add functionality to a schema.
// You are enhancing the UserSchema with methods and functionality provided by the passport-local-mongoose plugin. For example:

// Password Hashing: Automatically hashes passwords when saving them to the database.
// Password Validation: Provides a method to validate passwords against the stored hash.
// User Serialization/Deserialization: Provides helper methods for Passport integration.
UserSchema.plugin(plm);
module.exports = mongoose.model("User", UserSchema);
