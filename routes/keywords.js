// routes/keywords.js

'use strict';

const express = require('express');

const router = express.Router();

const Topic = require('../models/topics');

const axios = require('axios');

const fs = require('jsonfile');

const H2020KeywordsAPI = "http://ec.europa.eu/research/participants/portal/data/call/trees/portal_keyword_tree.json";



function walkTree(node, callback){
    if (node.children.length === 0){
        callback(node)
        return 
    }
    callback(node)
    node = node.children
    node.forEach((child) => {
        walkTree(child, callback)
    })
}



fs.readFile('data/keywords.json', function(err, data){
    if (err){
        console.log(err);
    } else {
    
    // traversal tree

        let keywords = [];
        walkTree(data[0], function(node) {
            keywords.push(node);
            //console.log(keywords)
            console.log(keywords.length)
        })


        
        // let keywordValue = [];

        // keywords.forEach((node) => {
        //     const query = {
        //         'size': 100,  // max size == 100
        //         'query': { "match_phrase": { "keywords": node.name }}
        //     }
            

        //     Topic.esSearch(query, function(err, results){
        //         if (err) return err;
        //         let value = results.hits.total;
        //         let count = {"term": node.name, "value": value};
        //         keywordValue.push(count);
        //         // console.log(keywordValue.length, value);
        //         // console.log(count)
        //         // fs.writeFile("data/test.json", count, {flag: 'a'}, function (err) {
        //         //     console.error(err)
        //         //   })
        //         console.log(keywordValue.length)
        //         // if (keywordValue.length === 385 ){
        //         //     fs.writeFile("data/test-2.json", keywordValue, function (err) {
        //         //         console.error(err)
        //         //     })
        //         // }
        //     })

        // })


        
        




        // walkTree(data[1], function(node) {
        //     // console.log(node.name)
        //     // search keyword using elastic search

        //     const query = {
        //         'size': 100,  // max size == 100
        //         'query': { "match_phrase": { "keywords": node.name }}
        //     }
            
            
        //     Topic.esSearch(query, function(err, results){
        //         if (err) return err;
        //         let value = results.hits.total;
        //         let count = {"term": node.name, "value": value};
        //         // console.log(count)
        //         // fs.writeFile("data/test.json", count, {flag: 'a'}, function (err) {
        //         //     console.error(err)
        //         //   })
        //     })
        // })
        
        // write back to the keywords file


}});







// const query = {
//     'size': 100,  // max size == 100
//     'query': { "match_phrase": { "keywords": term }}
// }


// Topic.esSearch(query, function(err, results){
//     console.log(query);
//     if (err) return err;

//     res.send(results.hits.hits);
// })

module.exports = router;