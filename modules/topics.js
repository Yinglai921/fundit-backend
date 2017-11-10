// topics module, update topics, a scheduled job

// routes/search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const mongoose = require('mongoose');

const axios = require('axios');

const SearchIndex = require ('search-index');

const fs = require('fs');

const path = require('path');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

const H2020TopicsDescAPIRoot = "http://ec.europa.eu/research/participants/portal/data/call/topics/";


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
      level: 'info',
    }),
    new (winston.transports.File)({
      filename: `${logDir}/history.log`,
      timestamp: tsFormat,
      json: true,
      level: 'info'
    })
  ]
})



module.exports = {

    removeTopics: function(){
        Topic.remove({}, function(err){
            logger.info("Topic delete");
        })
        .catch(error => {
            logger.info(error)
        })
    },
    
    writeTopics: function(){
        axios.get(H2020TopicsAPI)
        .then(response => {
            // write budget info to closed topics
            fs.readFile(path.join(__dirname, '../data/budget.json'), function(err, data){
                if (err){
                    return logger.info(err);
                }
                const projectData = JSON.parse(data);
                const projects = projectData.projects;
                
                let topics = response.data.topicData.Topics;
                topics.forEach((topic, i) => { 
        
                    if (topic.keywords !== undefined)
                        topic.keywordstr = topic.keywords.join();
                    if (topic.tags !== undefined)
                        topic.tagstr = topic.tags.join();

                    let budget = 0;
                    projects.forEach((project) => {
                        if (project.CD_TOPIC == topic.identifier){
                            budget += project.AM_EC_CONTRIBUTION;
                        }
                    })
                    if (budget !== 0){
                        topic.budget = `€${(budget / 1000000).toFixed(2)}M`;
                    }
        
                    // write description to each topic 
                    axios.get(`${H2020TopicsDescAPIRoot}${topic.identifier.toLowerCase()}.json`).then(response => {
                        if (response.data.description !== undefined){
                            topic.description = response.data.description;
                        }
                        Topic.create(topic);  
                        console.log(i, topics.length);
                        if (i+1 == topics.length){
                            logger.info("Topic update finish.")
                        }                  
                    })
                    .catch(error => {
                        Topic.create(topic); 
                        console.log("error: ", i, topics.length);
                        if (i+1 == topics.length){
                            logger.info("Topic update finish.")
                        }
                    })   
                })

            })

        })
        .catch(error => {
            logger.info(error);
        });
    }

}


