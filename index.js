const express = require('express');
const app = express();

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