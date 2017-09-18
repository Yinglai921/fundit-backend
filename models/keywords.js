// models/keywords.js

const mongoose = require('mongoose');
const tree = require('mongoose-tree');
let Schema = mongoose.Schema;

let KeywordSchema = new Schema({
    ccm2_Id: {type: String},
    description: {type: String},
    parent: {type: String},
    value: {type: Number},
    children: {type: Array}
})

module.exports = mongoose.model('keywords', KeywordSchema);
