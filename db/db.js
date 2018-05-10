var mongoose = require('mongoose');

//connect to the database
mongoose.connect("mongodb://indra:mongo@ds119820.mlab.com:19820/mongodbsandbox");


module.exports ={
    mongoose
}