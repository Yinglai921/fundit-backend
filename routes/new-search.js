// routes/new-search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const SearchIndex = require ('search-index');

const request = require('request');

const JSONStream = require('JSONStream');

const router = express.Router();


const options = {
    indexPath: 'myCoolIndex',
    logLevel: 'error'
  }

let index;
let searchResults = [];

function indexData(err, newIndex){
    if(!err){
        index = newIndex;
    }
}

SearchIndex(options, indexData);

router.route('/search')

    .get((req, res) => {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        
        // const term = req.param('q').toString();
        // const inTitle = req.param('intitle') == 'true' ? true : false;
        // const inKeywords = req.param('inkeywords') == 'true' ? true : false;
        // const inTags = req.param('intags') == 'true' ? true : false;
        // const inDescription = req.param('indescription')  == 'true' ? true : false;
        // const inOpen = req.param('inopen') == 'true' ? true : false;

        // const query = {
        //     term: term,
        //     inTitle: inTitle,
        //     inKeywords: inKeywords,
        //     inTags: inTags,
        //     inDescription: inDescription,
        //     inOpen: inOpen
        // }

        //const size = parseInt(req.param('size'));

        // readTopics().then(() => {
        //     searchTopics(topics, query).then(() => {
        //         res.send(searchResults);
        //     })
        // })

        let q = {};
        q.query = {
            AND: {'*': ['bio']}
          }
        q.pageSize = 3000
        searchResults = [];

        index.search(q)
        .on("data", function(doc){
            searchResults.push(doc['document']['title']);
        })
        .on('finish', function(){
            res.send(searchResults);
        })


    })




module.exports = router;







