// topics module, update topics, a scheduled job

// routes/search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const mongoose = require('mongoose');

const axios = require('axios');

const SearchIndex = require ('search-index');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

const H2020TopicsDescAPIRoot = "http://ec.europa.eu/research/participants/portal/data/call/topics/"

module.exports = {

    removeTopics: function(){
        Topic.remove({}, function(err){
            console.log("Topic delete");
        })
        .catch(error => {
            console.log(error)
        })
    },
    
    writeTopics: function(){
        axios.get(H2020TopicsAPI)
        .then(response => {
        //console.log(response);
            let topics = response.data.topicData.Topics;
            topics.forEach((topic, i) => { 
    
                if (topic.keywords !== undefined)
                    topic.keywordstr = topic.keywords.join();
                if (topic.tags !== undefined)
                    topic.tagstr = topic.tags.join();
    
                axios.get(`${H2020TopicsDescAPIRoot}${topic.identifier.toLowerCase()}.json`).then(response => {
                    if (response.data.description !== undefined){
                        topic.description = response.data.description;
                    }
                    console.log(i, topics.length);
                    Topic.create(topic);                     
                })
                .catch(error => {
                    Topic.create(topic); 
                    console.log("error: ", i, topics.length);
                })   
            })
        })
        .catch(error => {
            console.log(error);
        });
    }

}


