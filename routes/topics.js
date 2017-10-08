// routes/search.js

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const router = express.Router();

const mongoose = require('mongoose');

const axios = require('axios');

const SearchIndex = require ('search-index');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

const H2020TopicsDescAPIRoot = "http://ec.europa.eu/research/participants/portal/data/call/topics/"


const request = require('request')
const JSONStream = require('JSONStream')



let index;
let topics;

const options = {
    indexPath: 'topicIndex',
    logLevel: 'error'
}

// index js object
const Readable = require('stream').Readable;
const dataStream = new Readable({ objectMode: true});


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


router.route('/writetopics')
    .get((req, res) => {
        axios.get(H2020TopicsAPI)
            .then(response => {
                //console.log(response);
                let topics = response.data.topicData.Topics;
                topics.forEach((topic, i) => { 
                  
                    axios.get(`${H2020TopicsDescAPIRoot}${topic.identifier.toLowerCase()}.json`).then(response => {
                        if (response.data.description !== undefined){
                            topic.description = response.data.description;
                        }
                        console.log(i, topics.length);
                        Topic.create(topic);
                        if (i+1 == topics.length){
                            res.send(" Write Topic done.")
                        }                      
                    })
                    .catch(error => {
                        Topic.create(topic); 
                        console.log("error: ", i, topics.length);
                        if (i+1 == topics.length){
                            res.send(" Write Topic done.")
                        }
                    })   

                })
            })
            .catch(error => {
                console.log(error);
            });
        
        //res.send("update Topic done")    
    
    })

    .delete((req, res) => {
       Topic.remove({}, function(err){
           res.send('Topic deleted')
       })
       .catch(error => {
           console.log(error)
       })
    })




router.route('/writeindex')
    .get((req, res) => {


        readTopics().then(() => {

            topics.forEach((topic, i) =>{
               // console.log(typeof(topic))
                dataStream.push(topic);
                console.log(i)
            })
            
            dataStream.push(null);

            console.log(dataStream)
        
            function indexData(err, newIndex){
                
                if (!err){
                    index = newIndex;

                    dataStream                       // <- stream of docs to be indexed
                      .pipe(index.defaultPipeline())
                      .pipe(index.add())
     
                }else{
                    console.log(err)
                }
            }
    
            SearchIndex(options, indexData);

        }).catch((error) => {
            console.log(error.message);
        })
    })

 module.exports = router;