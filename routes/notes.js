'use strict';
const express = require('express');
const User = require('../models/users');
const router = express.Router();
const passport = require('passport');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

function getNoteAtNext(req, res, next){
  const id = req.user.id;
  User.findOne({_id: id})
    .then((user) => {
      const {head} = user;
      let notes;
      while (head.next !== null) {
        notes += head.note + ' '  
      }
      
      req.note = notes;
    })
    .then(() => next())
    .catch(err => next(err));
}


// router.get('/', getNoteAtNext, (req, res) => {
//   res.json(req.note);
// });

router.get('/', (req,res)=>{
  const id = req.user.id;
  User.findOne({_id:id})
  .then(user=>{
      res.status(200);
      res.json(user.head);
  });
});

/*
    When correct:
    double mScore and increment notes.note.correct by 1
    When incorrect:
    set mScore back to 1 and increment notes.note.incorrect by 1


    Move currentNote to index mScore, next note in index mScore changed to currentNote

    [A,B,C,D,E,F]

    head = A
    A.next = B
    *get question right*
    A.correct++ - done
    A.mScore*2 - WIP
    head = A.next - done
    *loop thru notes*
    temp (D) = notes[A.mScore].next
    notes[A.mScore].next = A
    A.next = temp (D)
    [B,C,A,D,E,F]
*/

function updateInCorrect(req, next, correct = false){
  const id = req.user.id;
  if(correct){
    // User.findOneAndUpdate(
    //   {_id: id, 'notes.note' : req.note.note}, {$inc: {'notes.$.correct' : 1}}, {new: true}
    // )
   
    /*
    
    
    temp = head
    curr = head
    prev = null
    while loop curr.next not equal null and count < temp.mscore
      prev = curr
      curr = curr.next
      count++
    prev.next = temp
    temp.next = curr
    head = head.next

    


    */

    
    
    User.findOne({_id: id})
      .then(user => {
        let notes = user.notes;
        let index, tempNote;
        notes.forEach((note,i) => {
          let temp;
          if(note.note === req.note.note){
            note.mScore*=2;
            temp = note.mScore;
            note.correct++;
            index = i;
          }
          if(i===temp || i === notes.length-1){
            tempNote = note.next;
            note.next = req.note.note;
          }
        });
        notes[index].next = tempNote;
        user.notes = notes;
        console.log(user);
        return notes.save();
      })
      .catch(err => console.log('err',err));
  }else{
    User.findOneAndUpdate(
      {_id: id, 'notes.note' : req.note.note}, {$inc: {'notes.$.incorrect' : 1}}, {new: true}
    )
      .then((notes) => {
        return notes;
      })
      .catch(err => console.log('err',err));
  }
}


function updateNext(req, res, next){
  const id = req.user.id;
  User.findOne({ _id: id }, { notes: { $elemMatch: { note: req.note.note } } })
    .then((notes) => {
      return notes.notes[0].next;
    })
    .then(nextNote => {
      console.log('next note is', nextNote);
      return User.findOneAndUpdate({ _id: id }, { head: nextNote }, { new: true });
    })
    .then(updatedNote => {
      console.log('nooottesss', updatedNote);
      next();
    })
    .catch(err => next(err));
}

// update notes with score and update next if btn pressed
// router.put('/', getNoteAtNext, updateNext, (req, res, next) => {
// // update note with score
//   const {answer} = req.body;
//   let notes;
//   if(answer === req.note.note){
//     notes = updateInCorrect(req, next, true);
//   }else{
//     notes = updateInCorrect(req, next);  
//   }
//   res.sendStatus(201);
// // update next
// });

//     temp = head
//     curr = head
//     prev = null
//     while loop curr.next not equal null and count < temp.mscore
//       prev = curr
//       curr = curr.next
//       count++
//     prev.next = temp
//     temp.next = curr
//     head = head.next

router.put('/', getNoteAtNext, updateNext, (req, res, next) => {
  // update note with score
  const {answer} = req.body;
  const id = req.user.id;
  User.findOne({_id:id})
    .then(user=>{
      let head = user.head;
      if(answer === head.note){
        head.mScore *=2;
        let index = head.mScore;
        head.correct++;
        let count = 0;
        let temp = head;
        let curr = head;
        head = head.next;
        let prev = null;
        while((curr.next!== null)&&(count<index)){
          prev = curr;
          curr = curr.next;
          count++;
        }
        prev.next = temp;
        temp.next = curr;
        return head;
      } else {
        head.mScore = 1;
        let index = head.mScore;
        head.incorrect++;
        let count = 0;
        let temp = head;
        let curr = head;
        let prev = null;
        while((curr.next!== null)&&(count<index)){
          prev = curr;
          curr = curr.next;
          count++;
        }
        prev.next = temp;
        temp.next = curr;
        return head;
      }
    })
    .then(head =>{
      while(head.next!==null){  
        console.log(head.note);
        head = head.next;
      }
      //return User.findOneAndUpdate({_id:id}, {head : head}, {new: true});
    });
});
    
          
          
          


        
//         let tempNote;
//         let temp;
//         notes.forEach((note,i) => {
//           if(note.note === req.note.note){
//             note.mScore*=2;
//             temp = note.mScore;
//             note.correct++;
//             tempNote = note;
//           }
//         });
//         let currNote = user.head;
//         let prevNote = user.head;
//         let count=0;
//         while((currNote.next!==null)&&(count<temp)){
//           prevNote = currNote;
//           currNote = currNote.next;
//           count++;
//         }
//         prevNote.next = tempNote;
//         tempNote.next = currNote;
//         user.notes = notes;
//         console.log(user.notes);
//         return user.save();
//       })
//       .catch(err => console.log('err',err));
//   }else{
//     notes = updateInCorrect(req, next);  
//   }
//   res.sendStatus(201);
//   // update next
// });

module.exports = router;
