// Load required packages
var mongoose = require('mongoose');

// Define our user schema
const user = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required},
  pendingTasks: { type: [String]},
  dateCreated: {type:Date}
});

const task = mongoose.Schema({
    name: { type : String},
    description: { type: String},
    deadline: {type:Date},
    completed: {type:Boolean},
    assignedUser: {type: String, default: ""},
    assignedUserName: {type:String, default:"unassigned"},
    dateCreated:{type:Date}
});

const User = mongoose.model('User', user);
const Task = mongoose.model('Task', task);

module.exports = {User,Task};
