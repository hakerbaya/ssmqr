const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-beautiful-unique-validation');


const studentSchema = new Schema({
    pic :{
        type: String,
        required: true
    },
    enrollId : {
        type : Number,
        required : true,
        unique: true

    },
    qrCode : {
        type : String,
        required: true
    },
    firstName : {
        type: String,
        required : true
    },
    middleName : {
        type : String,
        required : false
    },
    lastName : {
        type: String,
        required : true
    },
    gender : {
        type: String,
        required: true
    },
    dob : {
        type: Date,
        required: true
    },
    parentage : {
        type : String,
        required : false
    },
    address: {
        type: String,
        required: true
    },
    
    department : {
        type: String,
        required: true
    },
    semester : {
        type : String,
        required : true
    },
    section : {
        type: String,
        required : true
    },
    busStop : {
        type : String,
        required: false
    }
});

studentSchema.plugin(uniqueValidator);

module.exports = student = mongoose.model('student', studentSchema);