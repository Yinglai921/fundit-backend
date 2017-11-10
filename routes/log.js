// routes/keywords.js

'use strict';

const express = require('express');

const router = express.Router();

const fs = require('fs');

const path = require('path');


router.route("/_monitor")
    .get((req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        //return res.json(topicLog);
        
        fs.exists(path.join(__dirname, '../log/monitor.log'), function (exists) {
            if (exists) {
                fs.stat(path.join(__dirname, '../log/monitor.log'), function (error, stats) {
                    fs.open(path.join(__dirname, '../log/monitor.log'), "r", function (error, fd) {
                        var buffer = new Buffer(stats.size);
     
                        fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                            var data = buffer.toString("utf8", 0, buffer.length);
                            res.send(data)
                            fs.close(fd);
                        });
                    });
                });
            }
    })
})


router.route("/_history")
.get((req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //return res.json(topicLog);
    
    fs.exists(path.join(__dirname, '../log/history.log'), function (exists) {
        if (exists) {
            fs.stat(path.join(__dirname, '../log/history.log'), function (error, stats) {
                fs.open(path.join(__dirname, '../log/history.log'), "r", function (error, fd) {
                    var buffer = new Buffer(stats.size);
 
                    fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                        var data = buffer.toString("utf8", 0, buffer.length);
                        res.send(data)
                        fs.close(fd);
                    });
                });
            });
        }
})
})

router.route("/_about")
.get((req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //return res.json(topicLog);
    
    fs.exists(path.join(__dirname, '../version'), function (exists) {
        if (exists) {
            fs.stat(path.join(__dirname, '../version'), function (error, stats) {
                fs.open(path.join(__dirname, '../version'), "r", function (error, fd) {
                    var buffer = new Buffer(stats.size);
 
                    fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                        var data = buffer.toString("utf8", 0, buffer.length);
                        res.send(data)
                        fs.close(fd);
                    });
                });
            });
        }
})
})

module.exports = router;