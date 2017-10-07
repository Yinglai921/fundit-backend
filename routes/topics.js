// routes/search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const router = express.Router();

const mongoose = require('mongoose');

const axios = require('axios');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

const H2020TopicsDescAPIRoot = "http://ec.europa.eu/research/participants/portal/data/call/topics/"


router.route('/write-topics')
    .get((req, res) => {
        axios.get(H2020TopicsAPI)
            .then(response => {
                //console.log(response);
                let topics = response.data.topicData.Topics;
                topics.forEach((topic, i) => { 
                  
                    axios.get(`${H2020TopicsDescAPIRoot}${topic.identifier.toLowerCase()}.json`).then(response => {
                        if (response.data.description !== undefined){
                            topic.description = response.data.description;
                        }
                        console.log(i, topics.length);
                        Topic.create(topic);
                        if (i+1 == topics.length){
                            res.send(" Write Topic done.")
                        }                      
                    })
                    .catch(error => {
                        Topic.create(topic); 
                        console.log("error: ", i, topics.length);
                        if (i+1 == topics.length){
                            res.send(" Write Topic done.")
                        }
                    })   

                })
            })
            .catch(error => {
                console.log(error);
            });
        
        //res.send("update Topic done")    
    
    })

    .delete((req, res) => {
       Topic.remove({}, function(err){
           res.send('Topic deleted')
       })
       .catch(error => {
           console.log(error)
       })
    })



router.route('/topics')
    .get((req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        Topic.find({}).sort({ createdAt: -1 })
            .exec((err, topics) => {
                if (err) {
                    return res.send(err);
                }
                return res.json(topics);
            })
    })

 module.exports = router;