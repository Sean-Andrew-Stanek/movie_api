//Location:  '.\Documents\GitHub\movie_api\'

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path'),
    morgan = require('morgan'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require ('./models.js'),
    {check, validationResult} = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// Use for local testing
// mongoose.connect('mongodb://127.0.0.1:27017/movieAPI', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const { update } = require('lodash');

//logger
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'})
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

const cors = require('cors');

let allowedOrigins = ['http://localhost:8080, http://localhost:1234', 'https://meek-nougat-c5e693.netlify.app/'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);        
    }
}));

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

app.use(express.static('public'));

app.get('/', (req, res) =>{
    res.send('Check out the documentation at /public/documentation.html');
});

/**
 * Handle POST requests to create a new user.
 *
 * @function
 * @name createUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the user creation process is complete.
 * @throws {Error} - If there is an unexpected error during the user creation process.
 * @fires {Object} newUser - The newly created user object. Sent in the response on success.
 * 
 */

app.post('/users', [
    check('username', 'Username is required').isLength({min:5}),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
    ]/* , passport.authenticate('jwt', {session: false }) */, async (req, res) => {
  
  
    let errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

    let hashedPassword = Users.hashPassword(req.body.password);

    await Users.findOne( { username: req.body.username })
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.username + ' already exists.');
            }else {
                Users.create({
                    username: req.body.username,
                    password: hashedPassword,
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


/**
 * Handle POST requests to add a movie to a user's favorites.
 *
 * @function
 * @name addFavoriteMovie
 * @param {Object} req - Express request object with parameters: id (user ID), movieId (movie ID).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the movie addition process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {Object} updatedUser - The updated user object (including the added movie) sent in the response on success.
 */

app.post('/users/:id/movies/:movieId', passport.authenticate('jwt', {session: false }), async(req, res) => {
    await Users.findById(req.params.id)
    .then(async(user)=>{
        //Check if user is modifying their own data
        if(req.user.username !== user.username)
        {
            return res.status(400).send('Permission denied');
        }
        if(user){
            console.log(req.params.movieTitle);
            await Movies.findById(req.params.movieId)
            .then(async(movie)=>{
                if(movie){
                    await Users.findByIdAndUpdate(req.params.id, {$addToSet: {favoriteMovies: movie.id}});
                    res.status(200).json(await Users.findById(req.params.id));
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

/**
 * Handle POST requests to add a movie to a user's favorites.
 *
 * @function
 * @name addFavoriteMovie
 * @param {Object} req - Express request object with parameters: id (user ID), movieId (movie ID).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the movie addition process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {Object} updatedUser - The updated user object (including the added movie) sent in the response on success.
 * CONTINUE HERE!!!  THIS IS NOT CORRECT!!!!
 */

app.get('/movies', passport.authenticate('jwt', {session: false }), async (req, res) => {
    await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((error) =>{
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//READ movie by id
app.get('/movies/:movieId', passport.authenticate('jwt', {session: false }) , async(req, res) => {
    console.log(Movies)
    await Movies.findById(req.params.movieId)
    .then((movie)=>{
        if(movie) {
            res.status(200).json(movie);
        }else{
            res.status(400).send('Movie "' + req.params.movieId + '" not found.');
        }
    }).catch((error) =>{
        console.error(error);
        res.status(500).send("Error: " + error);
    }) 
});

//READ description of genre
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false }) , async(req, res) => {
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
app.get('/movies/director/:directorName', passport.authenticate('jwt', {session: false }) , async(req, res) => {
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
app.put('/users/:id', passport.authenticate('jwt', {session: false }), [
    check('username', 'Username is required').optional().isLength({min:5}),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').optional().isAlphanumeric(),
    check('password', 'Password is required').optional().not().isEmpty(),
    check('email', 'Email does not appear to be valid').optional().isEmail()
    ], async(req, res) => {

    let errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

    await Users.findById(req.params.id)
    .then(async (user)=> {
        //Check if user is modifying their own data
        if(req.user.username !== user.username)
        {
            return res.status(400).send('Permission denied');
        }

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
                    let hashedPassword = Users.hashPassword(req.body.password); 
                    await Users.findByIdAndUpdate(req.params.id, {password: hashedPassword})
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

                res.status(200).json(await Users.findById(req.params.id));
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
app.delete('/users/:id/movies/:movieId', passport.authenticate('jwt', {session: false }), async(req, res) => {
    
    await Users.findById(req.params.id)
    .then(async(user)=>{
        if(req.user.username !== user.username)
        {
            return res.status(400).send('Permission denied');
        }
    });
    
    Movies.findById(req.params.movieId)
    .then(async (movie)=>{

        if(!movie)
            res.status(500).send("Movie Not Found.");
        await Users.findByIdAndUpdate(req.params.id, {$pull: {favoriteMovies: movie._id}});
        res.status(200).json(await Users.findById(req.params.id));
    }).catch((error)=>{
        console.error(error);
        res.status(400).send("Error: " + error);
    })
});

//DELETE user
app.delete('/users/:id', passport.authenticate('jwt', {session: false }), (req, res) => {
    Users.findByIdAndRemove(req.params.id)
    .then((user) => {

        if(req.user.username !== user.username)
        {
            return res.status(400).send('Permission denied');
        }
        
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

//Port to listen on
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port: ' + port);
});