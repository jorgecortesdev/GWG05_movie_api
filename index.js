const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

    
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/myflixDB');

let users = [
    {
        id: 1,
        name: "John",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Jane",
        favoriteMovies: ["Jumanji"]
    }
];

let topMovies = [
    {    
        "Title": "Jumanji",
        "Director": {
        "Name": "Joe Johnston",
        "Bio": "Joseph Eggleston Johnston II is an American film director, producer, writer, and visual effects artist.",
        "Birth": "May 13, 1950"
        },
        "Description": "In this series of events Alan Parrish discovers a board game full of Mistery and Chaos that will change his life forever.",
        "Feature": false,
        "Genre": {
        "Name": "Family",
        "Description": "films intended for a wide age range, from children to adults, focusing on relatable and wholesome themes like love, hope, and adventure."
      }
    },
    {
        Title: 'Captain America: Civil War',
        Director: 'Anthony Russo, Joe Russo'
    },
    {
        Title: 'Wall-E',
        Director: 'Andrew Stanton',
    },
    {
        Title: 'Transformers',
        Director: 'Michael Bay'
    },
    {
        Title: 'Home',
        Director: 'Tim Johnson'
    },
    {
        Title: 'The Incredible Hulk',
        Director: 'Louis Leterrier'
    },
    {
        Title: 'The Goonies',
        Director: 'Richard Donner'
    },
    {
        Title: 'The Matrix',
        Director: 'Lana Wachowski, Lilly Wachowski'
    },
    {
        Title: 'Back To The Future',
        Director: 'Robert Zemeckis'
    },
    {
        Title: 'The Incredibles',
        Director: 'Brad Bird'
    }
];

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//CREATE/POST requests
app.post('/users/:id/movies/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(` ${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE favoriteMovies from array
app.delete('/users/:id/movies/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(` ${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE users account
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user')
    }
})

// Delete a user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//UPDATE/PUT requests
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
})

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send(`Error: ` + err);
  })

});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send(`Error: ` + err);
  });
});

// READ/GET requests
app.get("/movies", (req, res) => {
    res.status(200).json(Movies);
})

// READ/GET requests
app.get("/movies/:title", (req, res) => {
    const { title } = req.params;
    const movie = Movies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("no such movie")
    }

})

// READ/GET requests
app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName } = req.params;
    const genre = Movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send("no such genre")
    }

})

// READ/GET requests
app.get("/movies/directors/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = Movies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send("no such director")
    }

})

// Get all users
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET requests
app.get("/", (req, res) => {
    res.send('Welcome to myFlix API.')
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});