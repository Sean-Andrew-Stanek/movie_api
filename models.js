const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    },
	director: {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Director'
	},
	image: String,
	featured: Boolean,
});

const directorSchema = mongoose.Schema({
    name: String,
    bio: String,
    birth: Date,
    death: Date,
})

const genreSchema = mongoose.Schema({
    name: String,
    description: String,
})

let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: Date,
    favoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Genre = Genre;
module.exports.Director = Director;