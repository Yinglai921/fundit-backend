
// routes/public.js

'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const path = require('path');
// route definitions here....

router.route('/')
    .get((req, res) => {
        // res.sendFile( path.resolve( __dirname +'/../public/index.html')); // load our public/index.html file
        res.sendFile(path.join(__dirname + '/../public/index.html'))
    });


module.exports = router;
