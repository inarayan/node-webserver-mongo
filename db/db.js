var mongoose = require('mongoose');

//connect to the database
mongoose.connect("mongodb://localhost:27017/test");


module.exports ={
    mongoose
}