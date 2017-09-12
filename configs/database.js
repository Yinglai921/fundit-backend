'use strict';

// dependencies
const mongoose = require('mongoose');

// set the database name
const dbName = 'fundit-api';

// connect to the database

mongoose.connect(`mongodb://localhost/${dbName}`);

//mongoose.connect('mongodb://mongo:27017');

// get notified if the connection
// was successful or not
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log(`Connected to the ${dbName} database`);
});