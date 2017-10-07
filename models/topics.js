
// models/topics.js

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//esClient = new elasticsearch.Client({host: 'http://localhost:9200',httpAuth: 'elastic:changeme'});

// create a new schema
var Topic = new Schema({
    topicId: {type: Number},
    subCallId: {type: Number},
    topicFileName: {type: String},
    callProgramme: {type: String},
    callFileName: {type: String},
    callStatus: {type: String},
    plannedOpeningDate: {type: String},
    plannedOpeningDateLong: {type: Number},
    publicationDate: {type: String},
    publicationDateLong: {type: Number},
    mainSpecificProgrammeLevelCode: {type: String},
    mainSpecificProgrammeLevelDesc: {type: String},
    deadlineDates: {type: Array},
    deadlineDatesLong: {type: Array},
    identifier: {type: String},
    title: {type: String},
    tags: {type: Array},
    keywords: {type: Array},
    flags: {type: Array},
    actions: {type: Array},
    callIdentifier: {type: String},
    callTitle: {type: String},
    description: {type: String }
});

//Topic.plugin(mongoosastic);

module.exports = mongoose.model('topic', Topic);