// module, index the topics, a scheduled job

'use strict';

const express = require('express');

const Topic = require('../models/topics');

const mongoose = require('mongoose');

const axios = require('axios');

const SearchIndex = require ('search-index');

const H2020TopicsAPI = "http://ec.europa.eu/research/participants/portal/data/call/h2020/topics.json";

const H2020TopicsDescAPIRoot = "http://ec.europa.eu/research/participants/portal/data/call/topics/"


const request = require('request')
const JSONStream = require('JSONStream')




let topics;

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


module.exports = function(index){
    
    this.flushIndex = function(){
        index.flush(function(err) {
            if (!err) console.log('success!')
            })
    }

    this.writeIndex = function(){
        readTopics().then(() => {
            
            topics.forEach((topic, i) => {
                dataStream.push(topic);
                console.log("datastream: ", i);
                })
            
                dataStream.push(null);
        
                dataStream                       // <- stream of docs to be indexed
                    .pipe(index.defaultPipeline())
                    .pipe(index.add())
                    .on("finish",() => {
                        console.log("Index finish.")
                    })
            
            }).catch((error) => {
                console.log(error.message);
                })
    }

}