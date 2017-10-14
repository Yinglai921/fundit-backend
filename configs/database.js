'use strict';

// dependencies
const mongoose = require('mongoose');

// set the database name
const dbName = process.env.MONGODB_NAME == undefined ? 'fundit-api' : process.env.MONGODB_NAME;

// connect to the database

if (process.env.MONGODB_USR == undefined){
    mongoose.connect(`mongodb://localhost/${dbName}`);
} else {
    mongoose.connect('mongodb://'+process.env.MONGODB_USR+':'+process.env.MONGODB_PASSWD+'@'+process.env.MONGODB_SERVER+':'+process.env.MONGODB_PORT+'/'+process.env.MONGODB_NAME);
}

// get notified if the connection
// was successful or not
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log(`Connected to ${dbName} database`);
});
