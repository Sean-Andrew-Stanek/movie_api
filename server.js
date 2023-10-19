//Location:  '.\Documents\GitHub\movie_api\'

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require ('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/movieAPI', {useNewUrlParser: true, useUnifiedTopology: true});

//Replace when mongoose is fully integrated
let users = require('./users.json'), movies = require('./movies.json');

//BODY PARSER
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

//Accessable files
app.use(express.static('public'));

//CREATE add new user
app.post('/users', async (req, res) => {
    await Users.findOne( { username: req.body.username })
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.username + ' already exists.');
            }else {
                Users.create({
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    birthday: req.body.birthday
                })
                //Send back positive and the new user object
                .then((user) => {res.status(201).json(user)})
                .catch((error)=> {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                });
            }
        }).catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});


//Create - add to user movie list
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if(user){
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to ${user.id}'s array`);
    }else{
        res.status(400).send('Please input name')
    }

});

//READ all movies
app.get('/movies', async (req, res) => {
    await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((error) =>{
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//READ movie by title
app.get('/movies/:title', async(req, res) => {
    await Movies.findOne( {'title': req.params.title})
    .then((movie)=>{
        if(movie) {
            res.status(200).json(movie);
        }else{
            res.status(400).send('Movie ' + reqTitle + ' not found.');
        }
    }).catch((error) =>{
        console.error(error);
        res.status(500).send("Error: " + error);
    }) 
});

//READ description of genre
app.get('/movies/genre/:genreName', async(req, res) => {
    await Movies.findOne( {'genre.name': req.params.genreName})
    .then((genreName)=>{
        if(genreName) {
            res.status(200).json(genre);
        }else{
            res.status(400).send('No such genre found');
        }
    }).catch((error) =>{
        console.error(error);
        res.status(500).send("Error: " + error);
    }) 
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
        res.status(200).send(`${movieTitle} has been removed from user ${user.id}'s array`);
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
        res.status(200).send(`User ${user.id} has been removed`);
    }else{
        res.status(400).send('Please input name')
    }

});




app.listen(8080, ()=>console.log("Server started on port 8080"));