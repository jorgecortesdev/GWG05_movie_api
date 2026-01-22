const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(morgan("common"));
app.use(express.static("public"));

const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://127.0.0.1:27017/myflixDB");

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

/**
 * Retrieves a list of movies.
 *
 * @route GET /movies
 * @returns {object[]} List of movies
 */
app.get("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movies.find();
    return res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Retrieves information about a specific movie by its title.
 *
 * @route GET /movies/:title
 * @param {string} req.params.title - The title of the movie to retrieve
 * @returns {object} Information about the movie
 */
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { title } = req.params;
    const movie = await Movies.findOne({ Title: title });

    if (movie) {
      return res.status(200).json(movie);
    }

    return res.status(404).json({ error: "no such movie" });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
});

/**
 * Retrieves information about a specific genre by its name.
 *
 * @route GET /movies/genre/:genreName
 * @param {string} req.params.genreName - The name of the genre to retrieve
 * @returns {object} Information about the genre
 */
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { genreName } = req.params;
    const movie = await Movies.findOne({ "Genre.Name": genreName });

    if (movie) {
      return res.status(200).json(movie.Genre);
    }

    return res.status(404).json({ error: "no such genre" });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
});

/**
 * Retrieves information about a specific director by their name.
 *
 * @route GET /movies/directors/:directorName
 * @param {string} req.params.directorName - The name of the director to retrieve.
 * @returns {Object} Information about the director.
 */
app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { directorName } = req.params;
    const movie = await Movies.findOne({ "Director.Name": directorName });

    if (movie) {
      return res.status(200).json(movie.Director);
    }

    return res.status(404).json({ error: "no such director" });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
});

/**
 * Retrieves a list of users.
 *
 * @route GET /users
 * @returns {object[]} List of users
 */
app.get("/users", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await Users.find().select("-Password");
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Retrieves information about a specific user by their username.
 *
 * @route GET /users/:Username
 * @param {string} req.params.Username - The username of the user to retrieve.
 * @returns {Object} Information about the user.
 */
app.get("/users/:Username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { Username } = req.params;
    const user = await Users.findOne({ Username: Username }).select(
      "-Password"
    );

    if (user) {
      return res.status(200).json(user);
    }

    return res.status(404).json({ error: "no such user" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Creates a new user.
 *
 * @route POST /users
 * @param {Object} req.body - The data of the new user to be created.
 * @returns {Object} The newly created user.
 */
app.post("/users", async (req, res) => {
  try {
    const newUser = req.body;

    // Input validation
    if (!newUser.Username || !newUser.Password || !newUser.Email) {
      return res
        .status(400)
        .json({ error: "Username, Password, and Email are required" });
    }

    let user = await Users.findOne({ Username: newUser.Username });

    if (user) {
      return res
        .status(400)
        .json({ error: `${newUser.Username} already exists` });
    }

    user = await Users.create({
      Username: newUser.Username,
      Password: newUser.Password,
      Email: newUser.Email,
      Birthday: newUser.Birthday,
    });

    return res.status(201).json({
      Username: user.Username,
      Email: user.Email,
      Birthday: user.Birthday,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Updates an existing user.
 *
 * @route PUT /users/:Username
 * @param {string} req.params.Username - The username of the user to be updated.
 * @param {Object} req.body - The updated data for the user.
 * @returns {Object} The updated user.
 */
app.put("/users/:Username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const filter = { Username: req.params.Username };
    const options = { new: true };
    let update = {};

    // update username if exists
    if (req.body.Username) {
      update["Username"] = req.body.Username;
    }

    // update password if exists
    if (req.body.Password) {
      update["Password"] = req.body.Password;
    }

    // update email if exists
    if (req.body.Email) {
      update["Email"] = req.body.Email;
    }

    // update birthday if exists
    if (req.body.Birthday) {
      update["Birthday"] = req.body.Birthday;
    }

    const user = await Users.findOneAndUpdate(filter, update, options);

    if (!user) {
      return res
        .status(400)
        .send({ error: `${req.params.Username} was not found` });
    }

    return res.status(200).json({
      Username: user.Username,
      Email: user.Email,
      Birthday: user.Birthday,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Adds a movie to a user's favorite movies list.
 *
 * @route POST /users/:Username/movies/:movieId
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.movieId - The id of the movie to be added.
 * @returns {Object} The updated user.
 */
app.post("/users/:Username/movies/:movieId", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const filter = { Username: req.params.Username };
    const options = { new: true };
    const update = { $push: { FavoriteMovies: req.params.movieId } };

    const user = await Users.findOneAndUpdate(filter, update, options);

    if (!user) {
      return res
        .status(400)
        .send({ error: `${req.params.Username} was not found` });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Removes a movie from a user's favorite movies list.
 *
 * @route DELETE /users/:Username/movies/:movieId
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.movieId - The id of the movie to be removed.
 * @returns {Object} The updated user.
 */
app.delete("/users/:Username/movies/:movieId", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const filter = { Username: req.params.Username };
    const options = { new: true };
    const update = { $pull: { FavoriteMovies: req.params.movieId } };

    const user = await Users.findOneAndUpdate(filter, update, options);

    if (!user) {
      return res
        .status(400)
        .send({ error: `${req.params.Username} was not found` });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
});

/**
 * Deletes a user from the system.
 *
 * @route DELETE /users/:Username
 * @param {string} req.params.Username - The unique identifier of the user to be deleted.
 * @returns {string} Success message indicating the user has been deleted.
 */
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { Username } = req.params;

    const user = await Users.findOneAndDelete({ Username: Username });

    if (!user) {
      return res.status(400).send({ error: `${Username} was not found` });
    }

    return res.status(200).send({ message: `User ${Username} was deleted` });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: error.message });
  }
});

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix API.");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
