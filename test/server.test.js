const expect = require('expect');
const request = require('supertest');
const express = require('express');

const {app} = require('./../server');

const{Todo} = require('./../model/TodoSchema');
var {ObjectID} = require('mongodb');

//Todos to insert
var Todos = [{
    "_id": new ObjectID(),
    "task":"Task 1",
    "assigned_to":"person1"
},{
    "_id": new ObjectID(),
    "task":"Task 2",
    "assigned_to":"person2"
}];

  beforeEach(function(done) {
    // runs before each test in this block
    Todo.remove({}).then(()=> {
        Todo.insertMany(Todos)
    }).then(()=> done());
    //Todo.remove({}).then(()=> done());
  });

describe('POST Test all the Post routes', ()=>{

    it('creates the todo task', (done)=>{
        request(app)
            .post('/todos')
            .send({"task":"Service your vehicle 2", "assigned_to":"Indra2"})
            .expect(201)
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
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.task).toBe('Task 1');
        }).end(done)
    });

    it('gets 404 error in case id is not found',(done)=>{
        var id = new ObjectID().toHexString();
        request(app)
        .get(`/todos/${id}`)
        .expect(404, done)
    })
});

describe('DELETE /todos/:id', () => {
    it('deletes a todo item using an ID', (done) => {
        var id = Todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
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
        .expect(404, done)
    });

    it('return a 400 error for an invalid Id', (done) => {
        var id = "abc";
        request(app)
        .delete(`/todos/${id}`)
        .expect(400, done)
    })

})


