// routes/new-search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const SearchIndex = require ('search-index');

const request = require('request');

const JSONStream = require('JSONStream');

const router = express.Router();

const winston = require('winston');

const fs = require('fs');

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
      json: true,
    }),
    new (winston.transports.File)({
      filename: `${logDir}/history.log`,
      timestamp: tsFormat,
      level: 'info'
    })
  ]
})

// ***End*** *** log to file settings *** //

router.route('/search')

    .get((req, res) => {

        let index = req.app.get('index'); 

        let term = req.param('q').toString();
        const inTitle = req.param('intitle') == 'true' ? true : false;
        const inKeywords = req.param('inkeywords') == 'true' ? true : false;
        const inTags = req.param('intags') == 'true' ? true : false;
        const inDescription = req.param('indescription')  == 'true' ? true : false;
        const inOpen = req.param('inopen') == 'true' ? true : false;

        //const callStatus = inOpen ? 'open' : '*'; // search term doesn't accept capital letter
        const query = {};
        query.query = [];
        query.pageSize = 3000;
        let notArray;
        
        logger.info(`search term = ${term}; in keywords = ${inKeywords}; in tags = ${inTags}; in description = ${inDescription}; in open = ${inOpen}`);
        
        
        if (term.length == 0){
            res.json([]);
        }else{  

            if (term.indexOf("NOT") !== -1){
                notArray = term.split("NOT")[1]; // we assume there is only one NOT appear
                term = term.slice(0, term.indexOf("NOT"));
                notArray = notArray.split(" ")
                    .filter((item) => { return item.length > 1})
                    .map((item) =>{ return item.toLowerCase()})
            }
    
            if (term.indexOf("OR") !== -1){
                let termArray = term.split("OR");
                termArray.forEach((data) => {
                    let searchArray = data.split(" ");
                    formQuery(
                        searchArray.filter((item) => {return item.length > 1}).map((item) =>{ return item.toLowerCase()})
                    );
                })
            } else {
                if (term == "*"){
                    formQuery(["*"])
                } else {
                    let termArray = term.split(" ");
                    formQuery(
                        termArray.filter((item) => {return item.length > 1}).map((item) =>{ return item.toLowerCase()})
                    );
                }
            }

            search();

        }
       

        function formQuery(searchArray){

            if (inTitle){
                let queryObj = {'AND':{},'NOT':{}};
                queryObj.AND.title = searchArray;
                if (inOpen){
                    queryObj.NOT.callStatus = ['closed'];
                }
                if (notArray !== undefined && notArray.length > 0){
                    queryObj.NOT.title = notArray;
                }
                query.query.push(queryObj)
            }
            if (inKeywords){
                let queryObj = {'AND':{},'NOT':{}};
                queryObj.AND.keywordstr = searchArray;
                if (inOpen){
                    queryObj.NOT.callStatus = ['closed'];
                }
                if (notArray !== undefined && notArray.length > 0){
                    queryObj.NOT.keywordstr = notArray;
                }
                query.query.push(queryObj)
            }

            if (inTags){
                let queryObj = {'AND':{},'NOT':{}};
                queryObj.AND.tagstr = searchArray;
                if (inOpen){
                    queryObj.NOT.callStatus = ['closed'];
                }
                if (notArray !== undefined && notArray.length > 0){
                    queryObj.NOT.tagstr = notArray;
                }
                query.query.push(queryObj)
            }
            if (inDescription){
                let queryObj = {'AND':{},'NOT':{}};
                queryObj.AND.description = searchArray;
                if (inOpen){
                    queryObj.NOT.callStatus = ['closed'];
                }
                if (notArray !== undefined && notArray.length > 0){
                    queryObj.NOT.description = notArray;
                }
                query.query.push(queryObj)
            }

        }

        function search(){ 

            let searchResults = [];
            index.search(query)
                .on("data", function(doc){
                    searchResults.push(doc['document']);
                })
                .on('end', function(){
                    res.send(searchResults);
                    logger.info("search results: ", searchResults.length);
                })
        }
    })




module.exports = router;


