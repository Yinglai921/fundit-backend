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


// normal search, with one word or one phase, multiple scopes
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
            'size' : 101,
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



// advanced search, support AND, OR, NOT in multiple scopes
router.route('/advancedsearch')
    
    .get((req, res) => {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        const ANDquery = req.param('andquery');
        const must_inTitle = req.param('must_title');
        const must_inKeywords = req.param('must_keywords');
        const must_inTags = req.param('must_tags');

        const ORquery = req.param('orquery');
        const should_inTitle = req.param('should_title');
        const should_inKeywords = req.param('should_keywords');
        const should_inTags = req.param('should_tags');

        const NOTquery = req.param('notquery');
        const mustnot_inTitle = req.param('mustnot_title');
        const mustnot_inKeywords = req.param('mustnot_keywords');
        const mustnot_inTags = req.param('mustnot_tags');

        // form fields array ["title", "keywords", "tags"]
        let must_fields_array = [];
        if(must_inTitle === "true"){must_fields_array.push("title")};
        if(must_inKeywords === "true"){must_fields_array.push("keywords")};
        if(must_inTags === "true"){must_fields_array.push("tags")};

        let should_fields_array = [];
        if(should_inTitle === "true"){should_fields_array.push("title")};
        if(should_inKeywords === "true"){should_fields_array.push("keywords")};
        if(should_inTags === "true"){should_fields_array.push("tags")};

        let mustnot_fields_array = [];
        if(mustnot_inTitle === "true"){mustnot_fields_array.push("title")};
        if(mustnot_inKeywords === "true"){mustnot_fields_array.push("keywords")};
        if(mustnot_inTags === "true"){mustnot_fields_array.push("tags")};
       
        let AND_array = ANDquery.split(";");
        let OR_array = ORquery.split(";");
        let NOT_array = NOTquery.split(";");

        let must_queries = [];
        let should_queries = [];
        let mustnot_queries = [];

        if (must_fields_array.length !== 0){
            if (AND_array[0] !== "undefined"){
                // form must query array
                AND_array.forEach(term => {
                    must_fields_array.forEach(field => {
                        if (field === "title"){
                            let query = { "match": { "title" : term } };
                            must_queries.push(query);
                        } else if (field === "keywords"){
                            let query = { "match": { "keywords" : term } };
                            must_queries.push(query);
                        } else if(field === "tags") {
                            let query = { "match": { "tags" : term } };
                            must_queries.push(query);
                        }
                    })
                })
            }
        }
        if (should_fields_array.length !== 0){
            if (OR_array[0] !== "undefined"){
                // form should query array
                OR_array.forEach(term => {
                    should_fields_array.forEach(field => {
                        if (field === "title"){
                            let query = { "match": { "title" : term } };
                            should_queries.push(query);
                        } else if (field === "keywords"){
                            let query = { "match": { "keywords" : term } };
                            should_queries.push(query);
                        } else if(field === "tags") {
                            let query = { "match": { "tags" : term } };
                            should_queries.push(query);
                        }
                    })
                })
            }
        }
        if (mustnot_fields_array.length !== 0){
            if (NOT_array[0] !== "undefined"){
                // form must not query array
                NOT_array.forEach(term => {
                    mustnot_fields_array.forEach(field => {
                        if (field === "title"){
                            let query = { "match": { "title" : term } };
                            mustnot_queries.push(query);
                        } else if (field === "keywords"){
                            let query = { "match": { "keywords" : term } };
                            mustnot_queries.push(query);
                        } else if(field === "tags") {
                            let query = { "match": { "tags" : term } };
                            mustnot_queries.push(query);
                        }
                    })
                })
            }
        }
        
        console.log(must_queries);
        console.log(should_queries);
        console.log(mustnot_queries);

        const query = {
            'size' : 101,
            "query": {
                "bool": {
                    "must": must_queries,
                    "must_not": mustnot_queries,
                    "should": should_queries
                }
            }
        }


        Topic.esSearch(query, function(err, results){
            if (err) return err;

            res.send(results.hits.hits);
        })


    });

module.exports = router;