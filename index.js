const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

    
const app = express();

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

//CREATE/POST requests
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need names')
    }

})

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

// READ/GET requests
app.get("/movies", (req, res) => {
    res.status(200).json(topMovies);
})

// READ/GET requests
app.get("/movies/:title", (req, res) => {
    const { title } = req.params;
    const movie = topMovies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("no such movie")
    }

})

// READ/GET requests
app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName } = req.params;
    const genre = topMovies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send("no such genre")
    }

})

// READ/GET requests
app.get("/movies/directors/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = topMovies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send("no such director")
    }

})

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