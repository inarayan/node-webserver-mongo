var env = process.env.NODE_ENV || "development";
console.log("env **** " + env);

if (env === 'development'){
    process.env.port=3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
}
else if (env === 'test')
{
    process.env.port=3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/TestTodoApp"
}
else if(env === "production")
{
    process.env.MONGODB_URI = "mongodb://indra:mongo@ds119820.mlab.com:19820/mongodbsandbox"
}

console.log(process.env.MONGODB_URI);

module.exports = {
    'secret':'superSecret'


}