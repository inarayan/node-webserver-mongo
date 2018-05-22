

var mongoose = require('mongoose');


//connect to the database
mongoose.connect(process.env.MONGODB_URI);
//mongoose.connect("mongodb://localhost:27017/test");


module.exports ={
    mongoose
}