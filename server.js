//Location:  '.\Documents\GitHub\movie_api\'

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    movies = require('./movies.json');

let users = require('./users.json')


app.use(bodyParser.json());


//CREATE add new user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if(newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(users);
    } else {
        res.status(400).send('user needs name');
    }
});

//Create user movie list
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if(user){
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to ${user.name}'s array`);
    }else{
        res.status(400).send('Please input name')
    }

});

//READ all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//READ by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title);

    if(movie) {
        res.status(200).json(movie);
    }else{
        res.status(400).send('no such movie');
    }
});

//READ by genre
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;
   
    if(genre){
        res.status(200).json(genre);
    }else{
        res.status(400).send('no such movie');
    }

});

//READ by director
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName).Director;
   
    res.status(200).json(director);
});


//UPDATE user info - name
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    let user = users.find( user => user.id == id);

    if(user){
        user.name = updateUser.name;
        res.status(200).json(user);
    }else{
        res.status(400).send('Please input name')
    }

})

//DELETE user movie list
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if(user){
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed to ${user.name}'s array`);
    }else{
        res.status(400).send('Please input name')
    }

});

//DELETE user
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id);

    if(user){
        users = users.filter( user => user.id != id);
        res.status(200).send(`User ${user.name} has been removed`);
    }else{
        res.status(400).send('Please input name')
    }

});




app.listen(8080, ()=>console.log("Server started on port 8080"));