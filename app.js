const express = require("express");
const connectToMongodb = require("./connection");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const passport = require("passport");
const expressSession = require("express-session");
const path = require("path");
const app = express();
const flash=require("connect-flash");
const PORT = 8000;

connectToMongodb("mongodb://localhost:27017/pinterest").then(() => {
  console.log("mongodb connected");
});
// view engine setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// this will use the flash
// this is use to show the error as a flash message when the credentials are invalid.
app.use(flash());
// resave: false: Prevents saving session data back to the session store if it hasn’t been modified.
// saveUninitialized: false: Ensures uninitialized sessions (those not modified or logged in yet) are not saved to the store.
// secret: A secret key used to sign the session ID cookie. In production, this should be stored securely (e.g., as an environment variable).

app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "sanketparsewar",
  })
);

// passport.initialize(): Initializes Passport and sets up middleware to handle authentication.
// passport.session(): Integrates Passport with session management, enabling persistent login sessions.
app.use(passport.initialize());
app.use(passport.session());
// Specifies how user information is stored in the session.
// serializeUser receives the user object when a user logs in.
// Typically, only a unique identifier (e.g., user.id) is stored in the session to minimize data storage.
passport.serializeUser(usersRouter.serializeUser());
// deserializeUser takes the ID stored in the session and fetches the full user object (e.g., from the database).
// The retrieved user object is attached to req.user, making it accessible in routes
passport.deserializeUser(usersRouter.deserializeUser());

app.use("/", indexRouter);
app.use("/user", usersRouter);

app.listen(PORT, () => {
  console.log("listening on port");
});
