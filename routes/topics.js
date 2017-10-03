// routes/search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const router = express.Router();

const mongoose = require('mongoose');

const axios = require('axios');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

const H2020TopicsDescAPIRoot = "http://ec.europa.eu/research/participants/portal/data/call/topics/"


router.route('/topics')
    .get((req, res) => {
        axios.get(H2020TopicsAPI)
            .then(response => {
                //console.log(response);
                let res = response.data.topicData.Topics;
                res.forEach((topic, i) => { 
                  
                    axios.get(`${H2020TopicsDescAPIRoot}${topic.identifier.toLowerCase()}.json`).then(response => {
                        if (response.data.description !== undefined){
                            topic.description = response.data.description;
                        }
                        console.log(i);
                        Topic.create(topic);                       
                    })
                    .catch(error => {
                        Topic.create(topic); 
                        console.log(error);
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

/****** ONLY CREATE ONCE *****/
// create data in database

// get data from h2020 topics and store it to DB

// IMPORTANTTTTTT
// IMPORTANTTTTTT



// IMPORTANTTTTTT
// IMPORTANTTTTTT

 /****** END OF CREATING DB *****/

 module.exports = router;