'use strict';
const express = require('express');
const User = require('../models/users');
const router = express.Router();
const passport = require('passport');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

function getNoteAtNext(req, res, next) {
  const id = req.user.id;
  User.findOne({ _id: id })
    .then((user) => {
      const { notes, next } = user;
      const noteToReturn = notes.filter((note) => {
        if (note.note === next) {
          return note;
        }
      });
      req.note = noteToReturn[0];
    })
    .then(() => next())
    .catch(err => next(err));
}


router.get('/', (req, res) => {
  const _id = req.user.id;
  User.find({_id})
    .then((user) => res.json(user));

});

function updateInCorrect(req, next, correct = false) {
  const id = req.user.id;
  if (correct) {
    User.findOneAndUpdate(
      { _id: id, 'notes.note': req.note.note }, { $inc: { 'notes.$.correct': 1 } }, { new: true }
    )
      .then((notes) => {
        return notes;
      })
      .catch(err => console.log('err', err));
  } else {
    User.findOneAndUpdate(
      { _id: id, 'notes.note': req.note.note }, { $inc: { 'notes.$.incorrect': 1 } }, { new: true }
    )
      .then((notes) => {
<<<<<<< HEAD
        console.log('updated notes:', notes)
||||||| merged common ancestors
=======
        console.log('updated notes:', notes);
>>>>>>> feature/algorithm
        return notes;
      })
      .catch(err => console.log('err', err));
  }
}


function updateNext(req, res, next) {
  const id = req.user.id;
  User.findOne({ _id: id }, { notes: { $elemMatch: { note: req.note.note } } })
    .then((notes) => {
      return notes.notes[0].next;
    })
    .then(nextNote => {
<<<<<<< HEAD
        // console.log('next note is', nextNote);
        return User.findOneAndUpdate({_id: id}, {next: nextNote}, {new: true} );
||||||| merged common ancestors
        console.log('next note is', nextNote);
        return User.findOneAndUpdate({_id: id}, {next: nextNote}, {new: true} );
=======
      // console.log('next note is', nextNote);
      return User.findOneAndUpdate({ _id: id }, { next: nextNote }, { new: true });
>>>>>>> feature/algorithm
    })
    .then(updatedNote => {
<<<<<<< HEAD
        // console.log('nooottesss', updatedNote);
        next();
||||||| merged common ancestors
        console.log('nooottesss', updatedNote);
        next();
=======
      // console.log('nooottesss', updatedNote);
      next();
>>>>>>> feature/algorithm
    })
    .catch(err => next(err));
}

// update notes with score and update next if btn pressed
router.put('/', (req, res, next) => {
  // update note with score
  const {answer} = req.body;
<<<<<<< HEAD
  let notes;
  if(answer === req.note.note){
    notes = updateInCorrect(req, next, true);
  }else{
    notes = updateInCorrect(req, next);  
  }
  res.sendStatus(200);
// update next
||||||| merged common ancestors
  let notes;
  if(answer === req.note.note){
    notes = updateInCorrect(req, next, true);
  }else{
    notes = updateInCorrect(req, next);  
  }
  res.sendStatus(201);
// update next
=======
  const id = req.user.id;
  User.findOne({_id:id})
    .then(user=>{
      let feedback;
      let head = user.head;
      if(answer === head.note){
        feedback = 'true';
        console.log('THIS IS A PRINT:', answer);
        head.mScore *=2;
        let index = head.mScore;
        head.correct++;
        let count = 0;
        let temp = head;
        let curr = head;
        head = head.next;
        let prev = null;
        while((curr!== null)&&(count<=index)){
          prev = curr;
          curr = curr.next;
          count++;
        }
        prev.next = temp;
        temp.next = curr;
      } else {
        feedback = 'false';
        head.mScore = 1;
        let index = head.mScore;
        head.correct++;
        let count = 0;
        let temp = head;
        let curr = head;
        head = head.next;
        let prev = null;
        while((curr!== null)&&(count<=index)){
          prev = curr;
          curr = curr.next;
          count++;
        }
        prev.next = temp;
        temp.next = curr;
      }
      return ({head, feedback});
    })
    .then(({head, feedback}) =>{
      let temp = head;
      let printed = '';
      while(temp){
        printed += temp.note + ' -> ';
        temp = temp.next;
      }
      console.log(printed);
      //   let temp = head;
      //   while(temp !==null){  
      //     console.log(temp.note);
      //     temp = temp.next;
      //   }
      User.findOneAndUpdate({_id:id}, {head : head}, {new: true})
        .then(({head}) => {
          console.log('new head', head.note);
          res.json({head : head.note,feedback});
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
>>>>>>> feature/algorithm
});

module.exports = router;


/* 
    [A]




*/