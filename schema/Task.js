const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title : {type : String},
    description : {type : Text},
    deadline : {type : String},
})

module.exports = mongoose.model('Task', taskSchema);