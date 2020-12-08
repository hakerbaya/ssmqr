const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-beautiful-unique-validation');


const fileSchemaCSV = new Schema({
    fileName :{
        type: String,
        required: true
    }
});

fileSchemaCSV.plugin(uniqueValidator);

module.exports = fileCSV = mongoose.model('fileCSV',fileSchemaCSV);