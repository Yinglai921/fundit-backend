// dependencies

const express = require('express');
const bodyParser = require('body-parser');
const SearchIndex = require('search-index');
const schedule = require('node-schedule');

const updateTopics = require('./modules/topics');
const updateIndex = require('./modules/topicIndex');
const updateKeywords = require('./modules/keywords');


// create the express app
var app = express();

// configure the body-parser to accept urlencoded bodies and json data
app.use(bodyParser.urlencoded({ extended: true }))
.use(bodyParser.json());

// database connection
require('./configs/database');

// inital the search index and path
const options = {
    indexPath: 'topicIndex',
    logLevel: 'error',
}

let index, searchResults;

function indexData(err, newIndex){
    if(!err){
        index = newIndex;
        app.set('index', index);

        // let updateIndex1 = new updateIndex(index);
        // updateIndex1.writeIndex();

        // a scheduled job, everyday 01:10, update search index
        schedule.scheduleJob('0 53 20 * * *', function(){
            let updateIndex1 = new updateIndex(index);
            updateIndex1.flushIndex();
        });

        schedule.scheduleJob('0 54 20 * * *', function(){
            let updateIndex1 = new updateIndex(index);
            updateIndex1.writeIndex();
        });

        // a scheduled job, everyday 01:20, update keyword tree collection
        schedule.scheduleJob('0 35 21 * * *', function(){
            let updateKeywords1 = new updateKeywords(index);
            updateKeywords1.removeTree();
            updateKeywords1.writeTree();
        })
    }
}

SearchIndex(options, indexData); 

// a scheduled job, everyday, 01:00, update Topic data collection
schedule.scheduleJob('0 40 20 * * *', function(){
    updateTopics.removeTopics();

});

schedule.scheduleJob('0 41 20 * * *', function(){
    updateTopics.writeTopics();
});




// register all routers, all routes are prefixed with /api
app.use('/api', require('./routes/topics'));  // use search
app.use('/api', require('./routes/new-search'));  // use search
app.use('/api', require('./routes/keywordTree'));

// set the port
app.listen(3001);
