var mongoose = require('mongoose');


//connect to the database
//mongoose.connect("mongodb://indra:mongo@ds119820.mlab.com:19820/mongodbsandbox" || "mongodb://localhost:27017");
mongoose.connect("mongodb://localhost:27017/test");


module.exports ={
    mongoose
}