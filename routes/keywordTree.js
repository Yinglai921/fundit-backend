// routes/keywords.js

'use strict';

const express = require('express');

const router = express.Router();

const Topic = require('../models/topics');

const Keyword = require('../models/keywords');

const axios = require('axios');

const fs = require('jsonfile');

const H2020KeywordsAPI = "http://ec.europa.eu/research/participants/portal/data/call/trees/portal_keyword_tree.json";


let count = 0;

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

function createKeyword(node){
    count += 1;
    console.log(count);
    Keyword.create(node);
}


///////////////////////////////
/// WRITE KEYWORDS DATA TO DB, run it only once 
///////////////////////////////


// fs.readFile('data/keywords.json', function(err, data){
//     if (err){
//         console.log(err);
//     } else {
    
//     Keyword.create(data);

// }});


///////////////////////////////
/// END OF WRITE KEYWORDS DATA TO DB
///////////////////////////////



router.route("/keywordtree")
    .get((req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        Keyword.find({}).sort({ createdAt: -1 })
            .exec((err, keyword) => {
                if (err) {
                    return res.send(err);
                }
                
                return res.json(keyword);

            })
    })


module.exports = router;