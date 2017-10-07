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

let index;
let topics;

const Readable = require('stream').Readable;
const s = new Readable({ objectMode: true})


function readTopics(){

    return new Promise(function(resolve, reject){

        Topic.find({}, function(err, results){
            topics = results;
            if (topics !== undefined)
                resolve();
            else
                reject();
        }).sort({ createdAt: -1 })

    })
}

readTopics().then(() => {

    topics.forEach((topic) =>{
        s.push(topic);
    })
    
    s.push(null);

    function indexData(err, newIndex){
        if (!err){
            index = newIndex;
            s.pipe(index.defaultPipeline())
             .pipe(index.add())      
        }

        console.log(index)
        
       let query = {
            AND: {"*" : ["gender"]}
        }
        
        index.search(query)
            .on("data", function(doc){
                console.log(doc);
            })

    }
    
    SearchIndex(options, indexData);


})






// const printResults = function (data) {
//     console.log('\n' + chalk.blue(data.document.id) + ' : ' + chalk.blue(data.document.title))
//     const terms = Object.keys(data.scoringCriteria[0].df).map(function(item) {
//     return item.substring(2)
//     })  
//     for (var key in data.document) {
//     if (data.document[key]) {
//         var teaser = tc(data.document[key], terms)
//         if (teaser) console.log(teaser)
//     }
//     }
//     console.log()
// }

// const search = function(){
//     index.search({
//         query:[{
//             '*' : ['gender']
//         }]
//     }).on('data', function(data){
//         console.log(data);
//     })
// }






module.exports = router;
// router.route('/new-search')

//     .get((req, res) => {

//         res.header("Access-Control-Allow-Origin", "*");
//         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//         const term = req.param('q').toString();
//         // const inTitle = req.param('intitle');
//         // const inKeywords = req.param('inkeywords');
//         // const inTags = req.param('intags');
//         // const inDescription = req.param('indescription');
//         // const inOpen = req.param('inopen');
//         //const size = parseInt(req.param('size'));

//         index.search({
//             query:[{
//                 '*' : [term]
//             }]
//         }).on('data', function(data){
//             console.log(data);
//         })
    
//     })






