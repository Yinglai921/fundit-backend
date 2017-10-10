// dependencies

const express = require('express');
const bodyParser = require('body-parser');
const SearchIndex = require('search-index');


// create the express app
var app = express();

// database connection
require('./configs/database');

// configure the body-parser to accept urlencoded bodies and json data
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json());


const options = {
    indexPath: 'topicIndex',
    logLevel: 'error'
  }

let index, searchResults;

function indexData(err, newIndex){
    if(!err){
        index = newIndex;
        app.set('index', index);
    }
}

SearchIndex(options, indexData); 


// register all routers, all routes are prefixed with /api
// app.use('/api', require('./routes/search'));


app.use('/api', require('./routes/topics'));   // inital index
app.use('/api', require('./routes/keywords'));  // use search
app.use('/api', require('./routes/new-search'));  // use search
app.use('/api', require('./routes/keywordTree'));
// set the port
app.listen(3001);
