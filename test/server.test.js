const expect = require('expect');
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const {app} = require('./../server');

const{Todo} = require('./../model/TodoSchema');
const{ User } = require('./../model/UserSchema');
require('./../config/config.js');
var {ObjectID} = require('mongodb');

var user1ObjId = new ObjectID();
var user2ObjId = new ObjectID();


var Users = [{
    "_id":user1ObjId,
    "email":"indra@example.com",
    "password":"123456!",
    "tokens":[{
        "token": jwt.sign({_id:user1ObjId.toHexString(), access:'auth'},process.env.JWT_SECRET).toString(),
        "access":"auth"
    }]}
    ,{
    "_id":user2ObjId,
    "email":"indra2@example.com",
    "password":"123456!",
        "tokens":[{
        "token": jwt.sign({_id:user2ObjId.toHexString(), access:'auth'},process.env.JWT_SECRET).toString(),
        "access":"auth"
    }]}
    ];

//Todos to insert
var Todos = [{
    "_id": new ObjectID(),
    "task":"Task 1",
    "assigned_to":"person1",
    "done":false,
    "dueDate": new Date().getTime(),
    "_creater":Users[0]._id
},{
    "_id": new ObjectID(),
    "task":"Task 2",
    "assigned_to":"person2",
    "done":"false",
    "dueDate":null,
    "_creater":Users[1]._id


}];

  beforeEach(function(done) {
    // runs before each test in this block
    Todo.remove({}).then(()=> {
        Todo.insertMany(Todos)
    }).then(()=> done());
    //Todo.remove({}).then(()=> done());
  });

  //load the users in the database
  beforeEach(function(done){
    User.remove({}).then(()=>{
        var user1 = new User(Users[0]).save();
        var user2 = new User(Users[1]).save();

        return Promise.all([user1, user2]).then(()=>{ done();})
    })
  })

describe('POST Test all the Post routes', ()=>{

    it('creates the todo task', (done)=>{
        request(app)
            .post('/todos')
            .send({"task":"Service your vehicle 2", "assigned_to":"Indra2"})
            .expect(201)
            .set('x-auth',Users[0].tokens[0].token)
            .expect(function(res){
        }).end((err, res) => { // 4
            if (err) {
            return done(err)
        }

        Todo.find({'task':"Service your vehicle 2"}).then((TodoDoc)=>{
            expect(TodoDoc.length).toBe(1);
            done();
            }).catch((e)=>{
                done(e);
            })

        });

    });

   it('cannot create todo with invalid data that fails the schema validation',(done)=>{
        request(app)
        .post('/todos')
        .send({task:'Invalid Task'})
        .set('x-auth',Users[0].tokens[0].token)
        .expect(400)
        .end((err,res)=>{
            if(err){
                return done(err);
            }
            Todo.find({}).then((todos)=>{
                expect(todos.length).toBe(2);
                done();
            }).catch((e)=>{
                done(e);
            })
        })
    });

});

describe('GET /todos/:id', ()=>{
    it('gets a todo using id', (done)=>{
        var id = Todos[0]._id.toHexString();
        request(app)
        .get(`/todos/${id}`)
        .set('x-auth',Users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.task).toBe('Task 1');
        }).end(done)
    });

    it('gets 404 error in case id is not found',(done)=>{
        var id = new ObjectID().toHexString();
        request(app)
        .get(`/todos/${id}`)
        .set('x-auth',Users[0].tokens[0].token)
        .expect(404, done)
    })
});

describe('DELETE /todos/:id', () => {
    it('deletes a todo item using an ID', (done) => {
        var id = Todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth',Users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.task).toBe("Task 1");
        }).end((err)=>{
            if(err){
                return done(err);
            }

            Todo.find({}).then((todos)=>{
            expect(todos.length).toBe(1);
            expect(todos[0].task).toBe("Task 2");
            done();

        }).catch((e)=>{
            done(e);
        })

        });


    });


    it('returns 404 when Id is not found', (done)=>{
        var id = new ObjectID();
        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth',Users[0].tokens[0].token)
        .expect(404, done)
    });

    it('return a 400 error for an invalid Id', (done) => {
        var id = "abc";
        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth',Users[0].tokens[0].token)
        .expect(400, done)
    })

});

describe('PATCH /todos/:id', ()=>{
    it('should update the todo', (done) => {
        var id = Todos[0]._id.toHexString();
        request(app)
        .patch(`/todos/${id}`)
        .send({"task":"This the first new task", "done": true})
        .set('x-auth',Users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.task).toBe("This the first new task");
            expect(res.body.todo.done).toBeTruthy();
        }).end(done)
    });

    it('should clear the dueDate when the todo is not completed', (done) => {
        var id = Todos[1]._id.toHexString();
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth',Users[1].tokens[0].token)
        .send({"task":"This the second new task", "done": false})
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.task).toBe("This the second new task");
            expect(res.body.todo.done).toBeFalsy();
            expect(res.body.todo.dueDate).toBeFalsy();
        }).end(done)
    })
});


describe('GET /user/me', ()=>{
    it('should find the  valid user',(done)=>{
        request(app)
        .get('/user/me')
        .set('x-auth',Users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.email).toBe(Users[0].email)
        })
        .end(done);
    });

    it('should return 401 due to invalid token', (done)=>{
        request(app)
        .get('/user/me')
        .set('x-auth', Users[0].tokens[0].token+'0')
        .expect(401)
        .end(done);
    })


});

describe('POST /users', ()=>{
    it('should create a user', (done)=>{
        var email = 'validuser@example.com'
        var password = 'validpassword123!'

        request(app)
        .post('/users')
        .send({"email":email, "password":password})
        .expect(201)
        .end((err)=>{
            if(err){
               done(err);
            }
        User.findOne({"email":email}).then((user)=>{
            expect(user.tokens[0].token).toExist();
            expect(user.email).toBe(email);
            done();
            });
        });
    });

    it('should return 400 for duplicate email id', (done)=>{
        var email="indra@example.com";
        request(app)
        .post('/users')
        .send({"email":email, "password":"123456!"})
        .expect(400)
        .end(done);
    })

    it('should throw 400 for invalid request',(done)=>{
        request(app)
        .post('/users')
        .send({"email":"", "password":""})
        .expect(400)
        .end(done);
    })
});

describe('POST /users/login', ()=>{
    it('returns the email if the email and password matches',(done)=>{
        var email = "indra@example.com";
        var password = "123456!"
        request(app)
        .post('/user/login')
        .send({"email": email, "password": password})
        .expect(200)
        .expect((res)=>{
            expect(res.body.email).toBe(email);
            expect(res.headers['x-auth']).toExist();
        })
        .end((err, res)=>{
            if(err){
                done(err);
            }

            User.findOne({"email":email}).then((user)=>{
            expect(user.tokens[1].token).toExist();
            expect(user.email).toBe(email);
            expect(user.tokens[1]).toInclude({
                access:'auth',
                token: res.headers['x-auth']
            });
            done();
            }).catch((e)=>{
                done(e);
            })
        });

    })


    it('returns 400 if the email and password is invalid', (done)=>{
        var email = "indra@example.com";
        var password = "12345!"
        request(app)
        .post('/user/login')
        .send({"email": email, "password": password})
        .expect(404)
        .end(done);
    })
});


describe('DELETE /user/me/token', ()=>{
    it('deletes the token when valid token is provided', (done)=>{
        var token = Users[0].tokens[0].token;
        var email = Users[0].email;


        request(app)
        .delete('/user/me/token')
        .set('x-auth', Users[0].tokens[0].token)
        .expect(200)
        .end((err)=>{
            if(err){
                done(err);
            }
            User.findOne({"email":email}).then((user)=>{
                expect(user.tokens[0]).toNotExist();
                done();
            }).catch((e)=>{
                done(e);
            })
        })
    });

    it('returns 401 when the token when invalid', (done)=>{

        request(app)
        .delete('/user/me/token')
        .set('x-auth', Users[0].tokens[0].token+'a')
        .expect(401)
        .end(done)
    })
});


