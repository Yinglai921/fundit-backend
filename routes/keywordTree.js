// routes/keywords.js

'use strict';

const express = require('express');

const router = express.Router();

const Keyword = require('../models/keywords');

const axios = require('axios');


router.route("/keywordtree")
    .get((req, res) => {
        Keyword.find({}).sort({ createdAt: -1 })
            .exec((err, keyword) => {
                if (err) {
                    return res.send(err);
                }   
                return res.json(keyword);
            })
    })

module.exports = router;