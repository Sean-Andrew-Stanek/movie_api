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

const { update } = require('lodash');
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
                    birthday: new Date(req.body.birthday)
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


//Create - add movie to user movie list
app.post('/users/:id/movies/:movieTitle', async(req, res) => {
    await Users.findById(req.params.id)
    .then(async(user)=>{
        if(user){
            console.log(req.params.movieTitle);
            await Movies.findOne({title: req.params.movieTitle})
            .then(async(movie)=>{
                if(movie){
                    console.log(movie._id);
                    //console.log(Object.values(user.favoriteMovies).indexOf({movie._id}));
                    await Users.findByIdAndUpdate(req.params.id, {$addToSet: {favoriteMovies: movie.id}});
                    res.status(200).send(req.params.movieTitle + " has been added");
                }else{
                    res.status(400).send("Could not find movie");
                }
            })
        }else{
            res.status(400).send("Could not find user.");
        }
    }).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    })
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
            res.status(400).send('Movie "' + req.params.title + '" not found.');
        }
    }).catch((error) =>{
        console.error(error);
        res.status(500).send("Error: " + error);
    }) 
});

//READ description of genre
app.get('/movies/genre/:genreName', async(req, res) => {
    await Movies.findOne( {'genre.name': req.params.genreName})
    .then((movie)=>{
        if(movie) {
            res.status(200).json(movie.genre);
        }else{
            res.status(400).send('No such genre found');
        }
    }).catch((error) =>{
        console.error(error);
        res.status(500).send("Error: " + error);
    }) 
});

//READ by director
app.get('/movies/director/:directorName', async(req, res) => {
    await Movies.findOne( {'director.name': req.params.directorName})
    .then((movie) => {
        if(movie){
            res.status(200).json(movie.director);
        }
        else{
            res.status(400).send('No director found with name: ' + req.params.directorName);
        }
    }).catch((error) =>{
        console.error(error);
        res.status(500).send("Error: " + error);
    })
});


//UPDATE user info - name
app.put('/users/:id', async(req, res) => {
    await Users.findById(req.params.id)
    .then(async (user)=> {
        if(user){
            //Checks if there are updatable fields
            if(!req.body.username && !req.body.password && !req.body.email && !req.body.birthday){
                res.status(400).send('No updatable fields found'); 
            }else{
                let updatedFields = [];

                if(req.body.username){
                    await Users.findByIdAndUpdate(req.params.id, {username: req.body.username})
                    updatedFields.push('username');
                }

                if(req.body.password){
                    await Users.findByIdAndUpdate(req.params.id, {password: req.body.password})
                    updatedFields.push('password');
                }

                if(req.body.email){
                    await Users.findByIdAndUpdate(req.params.id, {email: req.body.email})
                    updatedFields.push('email');
                }

                if(req.body.birthday){
                    console.log(req.body.birthday + " " + new Date(req.body.birthday));
                    await Users.findByIdAndUpdate(req.params.id, {birthday: new Date(req.body.birthday)})

                    updatedFields.push('birthday');
                }

                console.log("updated: " + updatedFields);

                res.status(200).json(user);
            }
        }else{
            res.status(400).send('No such user found');
        }
    }).catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
    })
});


//DELETE movie from user movie list
app.delete('/users/:id/movies/:movieID', (req, res) => {
    Users.findByIdAndUpdate(req.params.id, 
        {$pull: {favoriteMovies: req.params.movieID}}
    )
    .then(()=>{
    
        res.status(200).send("movie removed");
    
    }).catch((error)=>{
        console.error(error);
        res.status(400).send("Error: " + error);
    })
});

//DELETE user
app.delete('/users/:id', (req, res) => {
    Users.findByIdAndRemove(req.params.id)
    .then((user) => {
        if(user){
            res.status(200).send("User Deleted");
        }else{
            res.status(400).send("User Not Found");
        }
    })
    .catch((error)=>{
        console.error(error);
        res.status(500).send("Error: " + error);
    })
});




app.listen(8080, ()=>console.log("Server started on port 8080"));