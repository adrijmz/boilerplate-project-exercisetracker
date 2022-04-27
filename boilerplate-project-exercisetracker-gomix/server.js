require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { ObjectId, ObjectID } = require('mongodb')

app.use(bodyParser.urlencoded({extended:false}))
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch(
  error=>console.log(error));

var userSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log:[{
    description: String,
    duration: Number,
    date: String
  }]
})

var userModel = mongoose.model('userModel', userSchema)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req,res)=>{
  var newUser = new userModel({username: req.body.username, count: 0})
  newUser.save((err,doc)=>{
    if(err) console.log(err)
    else{
      res.json({
        username: doc.username,
        _id: doc.id
      })
    }
  })
})

app.get('/api/users', (req,res)=>{
  userModel.find((err,docs)=>{
    if(err) console.error(err)
    else{
      res.json(docs)
    }
  })
})

app.post('/api/users/:id/exercises', (req,res)=>{
  userModel.findById(req.body.id, (err,user)=>{
    if(err) res.json({error: 'invalid id'})
    else{
      let reqDate
      if(!req.body.date){
        reqDate = new Date().toUTCString()
      }
      else{
        reqDate = new Date(req.body.date).toDateString()
      }
      let myExercise = {
        description: req.body.description,
        duration: req.body.duration,
        date: reqDate
      }
      //user.log.push(myExercise)
      user.count += 1
      user.log.push(myExercise)
      user.save((err, userSaved)=>{
        if(err) console.log(err)
        else{
          res.json({
            _id: userSaved.id,
            username:userSaved.username,
            date: myExercise.date,
            duration: myExercise.duration,
            description: myExercise.description
          })
        }
      })
    }
  })
})

app.get('/api/users/:id/logs', (req,res)=>{
  userModel.findById(req.params.id, (err,doc)=>{
    if(err) console.error(err)
    else{
      res.json(doc)
    }
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
