// a schedued job, udpate keyword tree data collection

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const Keyword = require('../models/keywords');

const axios = require('axios');

const fs = require('fs');

const SearchIndex = require ('search-index');

const H2020KeywordsAPI = "http://ec.europa.eu/research/participants/portal/data/call/trees/portal_keyword_tree.json";

const winston = require('winston');

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
      level: 'info'
    }),
    new (winston.transports.File)({
      filename: `${logDir}/updateKeywords.log`,
      timestamp: tsFormat,
      level: 'info'
    })
  ]
})

// ***End*** *** log to file settings *** //


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

function modifyTree(node){
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

function SearchKeywordInOpenTopics(keyword, index){

    console.log(keyword)
    let lowkeyword = keyword.toLowerCase();
    let keywordList = lowkeyword.split(" ");
    return new Promise(function(resolve, reject){
        const query = {};
        query.query = [
            {
                'AND':{
                    "keywordstr" : keywordList,
                    "callStatus" : ['open']
                }
            }
        ];
        query.pageSize = 3000;

        index.totalHits(query, function(err, count){
                tempValue = count;
                console.log("hits: ",tempValue);
                console.log("query: ", keywordList);
                if (tempValue !== -1)
                    resolve()
                else   
                    reject()
            })
    })

}

function SearchKeywordInTopics(keyword, index){

    return new Promise(function(resolve, reject){

        let lowkeyword = keyword.toLowerCase();
        let keywordList = lowkeyword.split(" ");

        const query = {};
        query.query = [
            {
                'AND':{
                    "keywordstr" : keywordList,
                    "callStatus" : ['*']
                }
            }
        ];
        query.pageSize = 3000;
    

        index.totalHits(query, function(err, count){
                tempValue = count;
                console.log("hits: ",tempValue);
                console.log("query: ", keywordList);
                if (tempValue !== -1)
                    resolve()
                else   
                    reject()
            })

    })

}


function AddOpenTopicsValue(flattenTree, index) {

    return new Promise(function(resolve, reject){
        let count = 0;
        flattenTree.forEach((keyword) =>{
            SearchKeywordInOpenTopics(keyword.name, index).then(function(){
                keyword.open_value = tempValue;
                count++;
                console.log(count);
                console.log(keyword.name);
                if (count == flattenTree.length){
                    resolve();
                }
            }).catch(function(error){
                console.log(error);
            })
        })
    })
}

function AddTopicsValue(flattenTree, index) {
    
        return new Promise(function(resolve, reject){
            let count = 0;
            flattenTree.forEach((keyword) =>{
                SearchKeywordInTopics(keyword.name, index).then(function(){
                    keyword.value = tempValue;
                    count++;
                    console.log(count);
                    console.log(keyword.name)
                    if (count == flattenTree.length){
                        resolve();
                    }
                }).catch(function(){
                    console.log("add topics error");
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


module.exports = function(index){

    this.removeTree = function(){
        Keyword.remove({}, function(err){
            logger.info("keyword tree deleted.")
        })
        .catch(error => {
            logger.info(error)
        })
    },

    this.writeTree = function(){
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
        
            // resolve the tree, get flattenTree, use flattenTree in 'then'
            walkTreePromise(root, modifyTree)
                .then(function(){
                    AddOpenTopicsValue(flattenTree, index).then(function(){  // iterate the flattenTree, add open_value for each
                        AddTopicsValue(flattenTree, index).then(function(){  // iterate the flattenTree, add value for each
                        
                            let finalTree = list_to_tree(flattenTree)
                            finalTree[0].children.push(finalTree[1]);
                            finalTree[0].children.push(finalTree[2]);

                            logger.info("keyword tree update finish.")
                            Keyword.create(finalTree[0]);
                        })
                    })
                }) 
        })
    }
}
