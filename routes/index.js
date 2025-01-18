const express = require("express");
const router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const upload = require("./multer");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
router.get("/", async function (req, res, next) {
  const posts = await postModel.find({}).populate("user");
  res.render("feed", { posts, currentPage: "feed" });
});
router.get("/register", function (req, res) {
  res.render("register");
});
router.get("/login", function (req, res, next) {
  // console.log(req.flash('error'))
  res.render("login", { error: req.flash("error") });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")
    .populate("likedposts"); // this includes the username when a user is logged in
  // console.log(user)
  res.render("profile", { user, currentPage: "profile" });
});

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("dp"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(403).send("No file uploaded");
    }
    try {
      const user = await userModel.findOneAndUpdate(
        { username: req.session.passport.user },
        { dp: req.file.filename }
      );
      res.redirect("/profile");
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/upload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(403).send("No file");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      image: req.file.filename,
      postcaption: req.body.postcaption,
      user: user._id,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/register", function (req, res) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({
    username,
    email,
    fullname,
  });
  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true, // to show error message in flash message and we are getting extra thing on login page.
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/delete", async function (req, res) {
  const postId = req.query.id; // Get the post ID from the query parameter
  if (!postId) {
    return res.status(400).send("Post ID is required");
  }
  try {
    await postModel.findByIdAndDelete(postId); // Delete the post by ID
    res.redirect("/profile"); // Redirect to the feed page after deletion
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Error deleting post");
  }
});

router.post("/like", async function (req, res) {
  try {
    const postId = req.body.id; // Expecting data sent in the request body
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.findById(postId);

    // Check if the user has already liked the post
    if (!post.likes.includes(user._id)) {
      post.likes.push(user._id);
      user.likedposts.push(postId);
      await user.save();
      await post.save();
    }
    res.json({ success: true, message: "Post liked successfully!" });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Login required to like post." });
  }
});

router.post("/unlike", async (req, res) => {
  try {
    const postId = req.body.id;
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.findById(postId);

    if (post.likes.includes(user._id)) {
      post.likes = post.likes.filter((like) => !like.equals(user._id));
      user.likedposts = user.likedposts.filter(
        (likedPost) => !likedPost.equals(postId)
      );

      await user.save();
      await post.save();
    }

    res.json({ success: true, message: "Post unliked successfully!" });
  } catch (error) {
    console.error("Error unliking the post:", error);
    res.status(500).json({ success: false, message: "Failed to unlike post." });
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
