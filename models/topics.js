
// models/topics.js

const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const elasticsearch = require('elasticsearch');
var Schema = mongoose.Schema;

//esClient = new elasticsearch.Client({host: 'http://localhost:9200',httpAuth: 'elastic:changeme'});

// create a new schema
var Topic = new Schema({
    topicId: {type: Number, es_indexed:true},
    subCallId: {type: Number, es_indexed:true},
    topicFileName: {type: String, es_indexed:true},
    callProgramme: {type: String, es_indexed:true},
    callFileName: {type: String, es_indexed:true},
    callStatus: {type: String, es_indexed:true},
    plannedOpeningDate: {type: String, es_indexed:true},
    plannedOpeningDateLong: {type: Number, es_indexed:true},
    publicationDate: {type: String, es_indexed:true},
    publicationDateLong: {type: Number, es_indexed:true},
    mainSpecificProgrammeLevelCode: {type: String, es_indexed:true},
    mainSpecificProgrammeLevelDesc: {type: String, es_indexed:true},
    deadlineDates: {type: Array, es_indexed:true},
    deadlineDatesLong: {type: Array, es_indexed:true},
    identifier: {type: String, es_indexed:true},
    title: {type: String, es_indexed:true},
    tags: {type: Array, es_indexed:true},
    keywords: {type: Array, es_indexed:true},
    flags: {type: Array, es_indexed:true},
    actions: {type: Array, es_indexed:true},
    callIdentifier: {type: String, es_indexed:true},
    callTitle: {type: String, es_indexed:true},
    description: {type: String, es_indexed:true}
});

Topic.plugin(mongoosastic);

module.exports = mongoose.model('topic', Topic);