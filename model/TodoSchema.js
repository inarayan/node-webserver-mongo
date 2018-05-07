var mongoose = require("mongoose");

var TodoSchema = new mongoose.Schema({
    task:{type:String, required:true, trim:true},
    assigned_to:{type: String, minlength:1, required:true, trim:true},
    done:Boolean,
    dueDate:String
});

var Todo = mongoose.model('Todo', TodoSchema);

module.exports={
    Todo
}
