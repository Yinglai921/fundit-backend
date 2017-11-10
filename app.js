// dependencies

const express = require('express');
const bodyParser = require('body-parser');
const SearchIndex = require('search-index');
const schedule = require('node-schedule');
const https = require('https');
const winston = require('winston');
const fs = require('fs');
const accessLog = require('kth-node-access-log');
const cors = require('cors');



const updateTopics = require('./modules/topics');
const updateIndex = require('./modules/topicIndex');
const updateKeywords = require('./modules/keywords');



// create the express app
var app = express();
app.use(accessLog({ useAccessLog: true }));
app.use(cors());
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
      level: 'info',
    }),
    new (winston.transports.File)({
      filename: `${logDir}/monitor.log`,
      timestamp: tsFormat,
      json: true,
      level: 'info'
    })
  ]
})

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
    fieldedSearch: true,
    fieldOptions:{
        topicId: {searchable: false},
        subCallId: {searchable: false},
        topicFileName: {searchable: false},
        callProgramme: {searchable: false},
        callFileName: {searchable: false},
        plannedOpeningDate: {searchable: false},
        plannedOpeningDateLong: {searchable: false},
        publicationDate: {searchable: false},
        publicationDateLong: {searchable: false},
        mainSpecificProgrammeLevelCode: {searchable: false},
        mainSpecificProgrammeLevelDesc: {searchable: false},
        deadlineDates: {searchable: false},
        deadlineDatesLong: {searchable: false},
        identifier: {searchable: false},
        flags: {searchable: false},
        actions: {searchable: false},
        callIdentifier: {searchable: false},
        callTitle: {searchable: false},
        budget: {searchable: false}
    },
    preserveCase: false,
}

let index, searchResults;

function indexData(err, newIndex){
    if(!err){
        index = newIndex;
        app.set('index', index);

        // a scheduled job, everyday 05:10, flush search index
        schedule.scheduleJob('0 10 5 * * *', function(){
            let updateIndex1 = new updateIndex(index);
            updateIndex1.flushIndex();
        });
        // a scheduled job, every 05:12, write new search index
        schedule.scheduleJob('0 12 5 * * *', function(){
            let updateIndex1 = new updateIndex(index);
            updateIndex1.writeIndex();
        });

        // a scheduled job, everyday 06:00, update keyword tree collection
        schedule.scheduleJob('0 0 6 * * *', function(){
            let updateKeywords1 = new updateKeywords(index);
            updateKeywords1.removeTree();
        })
        schedule.scheduleJob('0 1 6 * * *', function(){
            let updateKeywords1 = new updateKeywords(index);
            updateKeywords1.writeTree();
        })
    }
}

SearchIndex(options, indexData); 

// *** END *** *** Search-Index settings *** //
// updateTopics.writeTopics();
// a scheduled job, everyday, 05:00, update Topic data collection
schedule.scheduleJob('0 0 5 * * *', function(){
    updateTopics.removeTopics();

});

schedule.scheduleJob('0 1 5 * * *', function(){
    updateTopics.writeTopics();
});


// register all routers, all routes are prefixed with /api
app.use('/api', require('./routes/search'));  // use search
app.use('/api', require('./routes/keywordTree'));
app.use('/api', require('./routes/log'));
app.use('/api', require('./routes/authentication'));


let httpsOptions;

if (process.env.SSL_CERTIFICATE_FILE !== undefined) {
    var password = fs.readFileSync(process.env.SSL_CERTIFICATE_KEY) + '';
    password = password.trim();
    logger.info('APPLICATION_STATUS: OK');
    httpsOptions = {
        pfx: fs.readFileSync(process.env.SSL_CERTIFICATE_FILE),
        passphrase: password
    }
}
    
try {
    // set the port, use https
    https.createServer(httpsOptions, app).listen(3001);
} catch (error) {
    app.listen(3001);
}





