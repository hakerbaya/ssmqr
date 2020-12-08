const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-beautiful-unique-validation');

const adminSchema = new Schema({
    userName : {
        type : String,
        required : true,
        unique: true
    },
    password : {
        type : String,
        required : true
    }

});

adminSchema.plugin(uniqueValidator);

module.exports = admin = mongoose.model('admin', adminSchema);