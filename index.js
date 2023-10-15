const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

//log.txt is created and kept as a write stream in appending mode
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'})

//logger setup
app.use(morgan('combined', {stream: accessLogStream}));

app.get('/', (req, res) => {
    res.send('All your base are belong to us.');
});

app.get('/movies', (req, res) => {
    res.json(top_ten_movies);
});

app.use(express.static('public'));

app.listen(8080, () => {
    console.log('Currently listening on port 8080');
});