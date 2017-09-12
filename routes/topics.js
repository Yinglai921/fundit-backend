// routes/topics.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const router = express.Router();

const mongoose = require('mongoose');

const axios = require('axios');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

/****** ONLY CREATE ONCE *****/
// create data in database

// get data from h2020 topics and store it to DB

// IMPORTANTTTTTT
// IMPORTANTTTTTT

// axios.get(H2020TopicsAPI)
//     .then(response => {
//         //console.log(response);
//         let res = response.data.topicData.Topics;
//         res.some((topic,i) => {
//             Topic.create(topic);
//             console.log(i);
            
//         })
//     })
//     .catch(error => {
//         console.log(error);
//     });

// IMPORTANTTTTTT
// IMPORTANTTTTTT

 /****** END OF CREATING DB *****/

// route definitions here....

router.route('/search')

    .get((req, res) => {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        const term = req.param('q').toString();
        const inTitle = req.param('intitle');
        const inKeywords = req.param('inkeywords');
        const inTags = req.param('intags');
        //const size = parseInt(req.param('size'));

        // const query = {
        //     'size': 100,  // max size == 100
        //     'query': { 
        //         "dis_max": {
        //             "queries": []
        //         }
        //     }
        // }

        // if (inTitle === 'true'){
        //     query.query.dis_max.queries.push( { "match_phrase": { "title": term }});
        // }

        // if(inKeywords === 'true'){
        //     query.query.dis_max.queries.push( { "match_phrase": { "keywords": term }});
        // }

        // if(inTags === 'true'){
        //     query.query.dis_max.queries.push( { "match_phrase": { "tags": term }});
        // }

        const query = {
            'size' : 100,
            "query": {
                "query_string" : {
                    "fields" : [],
                    "query" : term
                }
            }
        }
        
        if (inTitle === 'true'){
            query.query.query_string.fields.push("title");
        }

        if(inKeywords === 'true'){
            query.query.query_string.fields.push("keywords");
        }

        if(inTags === 'true'){
            query.query.query_string.fields.push("tags");
        }


        if(inTitle === 'false' && inKeywords === 'false' && inTags === 'false'){
            res.send([]);
        } else {
            Topic.esSearch(query, function(err, results){
                console.log(query);
                if (err) return err;

                res.send(results.hits.hits);
            })
        }

    });

module.exports = router;