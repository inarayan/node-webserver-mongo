const expect = require('expect');
const request = require('supertest');
const express = require('express');

const {app} = require('./../server');

const{Todo} = require('./../model/TodoSchema');

  beforeEach(function(done) {
    // runs before each test in this block
    Todo.remove({}).then(()=> done())
  });

describe('POST Test all the Post routes', ()=>{


    it('creates the todo',(done)=>{

        request(app)
            .post('/todos')
            .send({task:'first Task',assigned_to:'no one'})
            .expect(201)
            .expect(function(res){
        }).end((err, res) => { // 4
        if (err) {
          return done(err)
        }
        Todo.find({'task':'first Task'}).then((Todos)=>{
            expect(Todos.length).toBe(1);
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
                return done(err)
            }
            Todo.find({}).then((todos)=>{
                expect(todos.length).toBe(0);
                done();
            }).catch((e)=>{
                done(e);
            })
        })
    })

    it('gets all the todos',(done)=>{
        request(app)
        .get()
    })

})

