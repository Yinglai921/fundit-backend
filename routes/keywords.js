// routes/keywords.js

'use strict';

const express = require('express');

const router = express.Router();

const Topic = require('../models/topics');

const Keyword = require('../models/keywords');

const axios = require('axios');

const fs = require('jsonfile');

const H2020KeywordsAPI = "http://ec.europa.eu/research/participants/portal/data/call/trees/portal_keyword_tree.json";





// the global value to store each search value
let tempValue = -1;
let flattenTree = [];

function walkTreePromise(node, callback){

    return new Promise(function(resolve, reject){
        function walkTree(node, callback) {
            if (node.children.length === 0){
                callback(node);
                return 
            }
            callback(node);
            node = node.children
            node.forEach((child) => {
                walkTree(child, callback)
            })
        }

        resolve(walkTree(node, callback));

    })

}



function debuglog(node){
    console.log(node.name)
    //node.value = 0;
    let tempObj  = {};
    tempObj.ccm2_Id = node.ccm2_Id;
    tempObj.description = node.description;

    if (node.name)
        tempObj.name = node.name;
    else
        tempObj.name = node.description;

    if (node.parent)
        tempObj.parent = node.parent;
    else
        tempObj.parent = 30000000
    
    flattenTree.push(tempObj);

}

function SearchKeywordInOpenTopics(keyword){

    return new Promise(function(resolve, reject){
        const queryOpen = {
            "size": 200,
            "query":{
                "bool":{
                    "must":[
                        { "match": {"callStatus": "Open"}}
                    ],
                    "filter":[
                        { "match_phrase": { "keywords": keyword }}
                        // {
                        //     "query_string":{
                        //         "default_field": "keywords",
                        //         "query": keyword,
                        //         "default_operator": "AND",
                        //     }
                        // }
                    ]
                }
            }
        }
        let request = Topic.esSearch(queryOpen, function(err, results){
            // console.log(query.query.filtered.query);
             if (err) return err;
             tempValue = results.hits.total;

             if (tempValue !== -1)
                resolve();
             else
                reject();
         })
    })

}

function SearchKeywordInTopics(keyword){

    return new Promise(function(resolve, reject){
        let query = {
            'size': 200,  // max size == 100
            'query': { "match_phrase": { "keywords": keyword }}
            // "query":{
            //     "bool":{
            //         "must":[
            //             //{ "match": {"callStatus": "Open"}}
            //         ],
            //         "filter":[
            //             //{ "match_phrase": { "keywords": keyword }}
            //             {
            //                 "query_string":{
            //                     "default_field": "keywords",
            //                     "query": keyword,
            //                     "default_operator": "AND",
            //                 }
            //             }
            //         ]
            //     }
            // }
        }
        Topic.esSearch(query, function(err, results){
            if (err) return err;
            
            tempValue = results.hits.total;

            if (tempValue !== -1){
                resolve();
            }else{
                reject();
            }

        })
    })

}


function AddOpenTopicsValue(flattenTree) {

    return new Promise(function(resolve, reject){
        let count = 0;
        flattenTree.forEach((keyword) =>{
            SearchKeywordInOpenTopics(keyword.name).then(function(){
                keyword.open_value = tempValue;
                count++;
                console.log(count);
                console.log(keyword.name);
                if (count == flattenTree.length){
                    resolve();
                }
            }).catch(function(){
                console.log("error");
            })
        })
    })
}

function AddTopicsValue(flattenTree) {
    
        return new Promise(function(resolve, reject){
            let count = 0;
            flattenTree.forEach((keyword) =>{
                SearchKeywordInTopics(keyword.name).then(function(){
                    keyword.value = tempValue;
                    count++;
                    console.log(count);
                    console.log(keyword.name)
                    if (count == flattenTree.length){
                        resolve();
                    }
                }).catch(function(){
                    console.log("error");
                })
            })
        })
}

function list_to_tree(list) {
    var map = {}, node, roots = [], i;
    for (i = 0; i < list.length; i += 1) {
        map[list[i].ccm2_Id] = i; // initialize the map
        list[i].children = []; // initialize the children
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parent !== 30000000) {
            // if you have dangling branches check that map[node.parentId] exists
            list[map[node.parent]].children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

router.route("/keywordmapvalue")
    .get((req, res) => {
        axios.get(H2020KeywordsAPI)
        .then(response => {
            let root = {
                ccm2_Id: 30000000,
                description: "H2020Keywords",
                name: "H2020Keywords",
                parent: 0,
                children:[]
            }
            response.data.forEach((data) => {
                if (data.parent == undefined){
                    data.parent == 30000000
                }
                root.children.push(data);
            })
            
            // res.send(root)
            // resolve the tree, get flattenTree, use flattenTree in 'then'
            walkTreePromise(root, debuglog)
                .then(function(){
                    AddOpenTopicsValue(flattenTree).then(function(){
                        //res.send(flattenTree);
                        AddTopicsValue(flattenTree).then(function(){
                             
                            let finalTree = list_to_tree(flattenTree)
                            finalTree[0].children.push(finalTree[1]);
                            finalTree[0].children.push(finalTree[2]);

                            res.send(finalTree[0])
                            Keyword.create(finalTree[0]);
                        })
                    })
                }) // iterate the flattenTree, add open_value for each
                // iterate the flattenTree, add value for each


        })
        
    })

    .delete((req, res) => {
        Keyword.remove({}, function(err){
            res.send('keyword tree deleted')
        })
        .catch(error => {
            console.log(error)
        })
     })





module.exports = router;

