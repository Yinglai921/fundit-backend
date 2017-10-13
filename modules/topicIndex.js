// module, index the topics, a scheduled job

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const mongoose = require('mongoose');

const axios = require('axios');

const fs = require('fs');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

const H2020TopicsDescAPIRoot = "http://ec.europa.eu/research/participants/portal/data/call/topics/"


const request = require('request')
const JSONStream = require('JSONStream')

const winston = require('winston');

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
      filename: `${logDir}/updateTopicIndex.log`,
      timestamp: tsFormat,
      level: 'info'
    })
  ]
})

// ***End*** *** log to file settings *** //


let topics;

// index js object
const Readable = require('stream').Readable;
const dataStream = new Readable({ objectMode: true});


function readTopics(){
    
    return new Promise(function(resolve, reject){

        Topic.find({}, function(err, results){
            topics = results;

            if (topics !== undefined)
                resolve();

            else{
                let reason = new Error('Topic is not initial');
                reject(reason);
            }
                
        }).sort({ createdAt: -1 })

    })
}


module.exports = function(index){
    
    this.flushIndex = function(){
        index.flush(function(err) {
            if (!err) logger.info('Index delete success!')
            })
    }

    this.writeIndex = function(){
        readTopics().then(() => {
            
            topics.forEach((topic, i) => {
                dataStream.push(topic);
                console.log("datastream: ", i);
                })
            
                dataStream.push(null);
        
                dataStream                       // <- stream of docs to be indexed
                    .pipe(index.defaultPipeline())
                    .pipe(index.add())
                    .on("finish",() => {
                        logger.info("Index finish.")
                    })
            
            }).catch((error) => {
                console.log(error.message);
                })
    }

}