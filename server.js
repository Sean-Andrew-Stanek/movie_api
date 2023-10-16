//Location:  '.\Documents\GitHub\movie_api\'

const app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    top_ten_movies = require('./movies.json');

    
app.use(bodyParser.json());


app.listen(8080, ()=>console.log("Server started on port 8080"));