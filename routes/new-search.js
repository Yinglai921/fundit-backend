// routes/new-search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const SearchIndex = require ('search-index');

const request = require('request');

const JSONStream = require('JSONStream');

const router = express.Router();

const options = {
    indexPath: 'topicIndex',
    logLevel: 'error'
  }

let index, searchResults;

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


        let term = req.param('q').toString();
        const inTitle = req.param('intitle') == 'true' ? true : false;
        const inKeywords = req.param('inkeywords') == 'true' ? true : false;
        const inTags = req.param('intags') == 'true' ? true : false;
        const inDescription = req.param('indescription')  == 'true' ? true : false;
        const inOpen = req.param('inopen') == 'true' ? true : false;

        const callStatus = inOpen ? 'open' : '*'; // search term doesn't accept capital letter
        const query = {};
        query.query = [];
        query.pageSize = 3000;
        let notArray;
        
        if (term.length == 0){
            res.json([]);
        }else{  

            if (term.indexOf("NOT") !== -1){
                notArray = term.split("NOT")[1]; // we assume there is only one NOT appear
                term = term.slice(0, term.indexOf("NOT"));
                console.log("term remove NOT: ", term)
                notArray = notArray.split(" ").filter((item) => {return item.length > 1});
                console.log("NOT array: ", notArray)
            }
    
            if (term.indexOf("OR") !== -1){
                let termArray = term.split("OR");
                termArray.forEach((data) => {
                    let searchArray = data.split(" ");
                    formQuery(searchArray.filter((item) => {return item.length > 1}));
                })
            } else {
                let termArray = term.split(" ");
                formQuery(termArray.filter((item) => {return item.length > 1}));
            }

            search();

        }
       

        function formQuery(searchArray){

            if (inTitle){
                let queryObj = {};
                queryObj.AND = {
                    "title" : searchArray,
                    "callStatus" : [callStatus]
                }
                if (notArray !== undefined && notArray.length > 0){
                    
                    queryObj.NOT = {
                        "title" : notArray,
                    }
                }
                query.query.push(queryObj)
                console.log("title query object: ", queryObj)
            }
            if (inKeywords){
                let queryObj = {};
                queryObj.AND = {
                    "keywordstr" : searchArray,
                    "callStatus" : [callStatus]
                }
                if (notArray !== undefined && notArray.length > 0){
                    queryObj.NOT = {
                        "keywordstr" : notArray,
                    }
                }
                query.query.push(queryObj)
            }

            if (inTags){
                let queryObj = {};
                queryObj.AND = {
                    "tagstr" : searchArray,
                    "callStatus" : [callStatus]
                }
                if (notArray !== undefined && notArray.length > 0){
                    queryObj.NOT = {
                        "tagstr" : notArray,
                    }
                }
                query.query.push(queryObj)
            }
            if (inDescription){
                let queryObj = {};
                queryObj.AND = {
                    "description" : searchArray,
                    "callStatus" : [callStatus]
                }
                if (notArray !== undefined && notArray.length > 0){
                    queryObj.NOT = {
                        "description" : notArray,
                    }
                }
                query.query.push(queryObj)
            }

        }

        function search(){ 
            searchResults = [];

            console.log("search query: ", query.query)
            console.log(" ")

            index.search(query)
                .on("data", function(doc){
                    searchResults.push(doc['document']);
                })
                .on('end', function(){
                    res.send(searchResults);
                })
        }
    })




module.exports = router;








// q.query = [                   // Each array element is an OR condition
//     {
//       AND: {             
//         'title': ['reagan'],    // 'reagan' AND 'ussr'   
//         'body':  ['ussr']
//       },
//       NOT: {
//         'body':  ['usa']        // but NOT 'usa' in the body field
//       }
//     },
//     {                           // OR this condition
//       AND: {                  
//         'title': ['gorbachev'], // 'gorbachev' AND 'ussr'
//         'body':  ['ussr']
//       },
//       NOT: {
//         'body':  ['usa']        // NOT 'usa' in the body field
//       }
//     }
//   }
// ]