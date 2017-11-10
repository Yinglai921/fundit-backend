'use strict';

const winston = require('winston');
const fs = require('fs');

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

// dependencies
const mongoose = require('mongoose');

// set the database name
const dbName = process.env.MONGODB_NAME == undefined ? 'fundit-api' : process.env.MONGODB_NAME;

// connect to the database

if (process.env.MONGODB_USR == undefined){
    mongoose.connect(`mongodb://localhost/${dbName}`,{
      useMongoClient: true
    });
} else {
    mongoose.connect('mongodb://'+process.env.MONGODB_USR+':'+process.env.MONGODB_PASSWD+'@'+process.env.MONGODB_SERVER+':'+process.env.MONGODB_PORT+'/'+process.env.MONGODB_NAME+'?ssl=true',{
      useMongoClient: true
    });
}


// get notified if the connection
// was successful or not
const db = mongoose.connection;

db.on('error', () =>{
    console.error.bind(console, 'connection error:');
    logger.info(console.error)
});
db.once('open', () => {
    logger.info(`Connected to ${dbName} database, - mongodb: OK (required)`);
});
