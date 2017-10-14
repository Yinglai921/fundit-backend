// dependencies

const express = require('express');
const bodyParser = require('body-parser');
const SearchIndex = require('search-index');
const schedule = require('node-schedule');
const https = require('https');
const winston = require('winston');
const fs = require('fs');

const updateTopics = require('./modules/topics');
const updateIndex = require('./modules/topicIndex');
const updateKeywords = require('./modules/keywords');



// create the express app
var app = express();


// *** Log to file settings *** //
// set up logger
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function tsFormat(){
    return `${(new Date()).toLocaleDateString()}, ${(new Date()).toLocaleTimeString()}`;
}
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (winston.transports.File)({
      filename: `${logDir}/results.log`,
      timestamp: tsFormat,
      level: 'info'
    })
  ]
})

app.set('logger', logger);
// ***End*** *** log to file settings *** //


// configure the body-parser to accept urlencoded bodies and json data
app.use(bodyParser.urlencoded({ extended: true }))
.use(bodyParser.json());

// database connection
require('./configs/database');


// *** Search-Index settings *** //
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

        // a scheduled job, everyday 01:10, flush search index
        schedule.scheduleJob('0 10 1 * * *', function(){
            let updateIndex1 = new updateIndex(index);
            updateIndex1.flushIndex();
        });
        // a scheduled job, every 01:12, write new search index
        schedule.scheduleJob('0 12 1 * * *', function(){
            let updateIndex1 = new updateIndex(index);
            updateIndex1.writeIndex();
        });

        // a scheduled job, everyday 02:00, update keyword tree collection
        schedule.scheduleJob('0 0 2 * * *', function(){
            let updateKeywords1 = new updateKeywords(index);
            updateKeywords1.removeTree();
        })
        schedule.scheduleJob('0 1 2 * * *', function(){
            let updateKeywords1 = new updateKeywords(index);
            updateKeywords1.writeTree();
        })
    }
}


SearchIndex(options, indexData); 

// *** END *** *** Search-Index settings *** //

// a scheduled job, everyday, 01:00, update Topic data collection
schedule.scheduleJob('0 0 1 * * *', function(){
    updateTopics.removeTopics();

});

schedule.scheduleJob('0 1 1 * * *', function(){
    updateTopics.writeTopics();
});


// register all routers, all routes are prefixed with /api
app.use('/api', require('./routes/search'));  // use search
app.use('/api', require('./routes/keywordTree'));

console.log(fs.readFileSync('/certs/localhost.p12'));

if(fs.readFileSync('/certs/localhost.p12') == undefined){
    // set the port
    app.listen(3001);
} else {
    // set the port, use https
    // KEY: /certs/localhost.p12 (Certificate in a java-keystore format)
    // CERT: /cert/localhost.pass (Passphrase for the p12 store)
    https.createServer({
        key: fs.readFileSync('/certs/localhost.p12'),
        cert: fs.readFile('/cert/localhost.pass')
    }, app).listen(3001)
}



