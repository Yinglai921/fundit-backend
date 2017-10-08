'use strict';

const express = require('express');

const Topic = require('../models/topics');

const router = express.Router();




const chalk = require('chalk')
const request = require('request')
const tc = require('term-cluster')
const url = 'https://raw.githubusercontent.com/fergiemcdowall/reuters-21578-json/master/data/fullFileStream/justTen.str'

const ops = {
  indexPath: 'myCoolIndex',
  logLevel: 'error'
}

// index js object
const Readable = require('stream').Readable;
const dataStream = new Readable({ objectMode: true});

var index;
var topics;

function readTopics(){
    
    return new Promise(function(resolve, reject){

        Topic.find({}, function(err, results){
            topics = results;

            if (topics !== undefined)
                resolve();

            else{
                let reason = new Error('Topic is not initial');
                reject(reason);
            }
                
        }).sort({ createdAt: -1 })

    })
}

readTopics().then(() => {

    topics.forEach((topic, i) =>{
        // console.log(typeof(topic))
         dataStream.push(topic);
         console.log(i)
     })
     
     dataStream.push(null);

     console.log(dataStream);

     const indexData = function(err, newIndex) {
        if (!err) {
          index = newIndex
        //   dataStream                       // <- stream of docs to be indexed
        //   .pipe(index.defaultPipeline())
        //   .pipe(index.add())
        //   .on('finish', searchCLI)
          searchCLI();
        }
      }
      
      const printPrompt = function () {
        console.log()
        console.log()
        process.stdout.write('search > ')
      }
      
      const searchCLI = function () {
        printPrompt()
        process.stdin.resume()
        process.stdin.on('data', search)
      }
      
      const search = function(rawQuery) {
        //console.log(rawQuery.toString().replace( /\r?\n|\r/g, '' ))
        index.search(rawQuery.toString().replace( /\r?\n|\r/g, '' ))
          .on('data', printResults)
          .on('end', printPrompt)
      }
      
      const printResults = function (data) {
        console.log('\n' + chalk.blue(data.document._id) + ' : ' + chalk.blue(data.document.title))
      //   const terms = Object.keys(data.scoringCriteria[0].df).map(function(item) {
      //     return item.substring(2)
      //   })  
      //   for (var key in data.document) {
      //     if (data.document[key]) {
      //       var teaser = tc(data.document[key], terms)
      //       if (teaser) console.log(teaser)
      //     }
      //   }
        console.log()
      }
      
      require('search-index')(ops, indexData)

})



module.exports = router;