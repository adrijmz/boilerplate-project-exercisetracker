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
  username: {type:String, required: true},
  count: Number,
  log:[{
    description: {type:String, required:true},
    duration: {type:Number, required: true},
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

app.post('/api/users/:_id/exercises', (req,res)=>{
  userModel.findByIdAndUpdate(req.body[':_id'],{ $inc: { count: 1 } }, {new: true }, (err,user)=>{
    if(err) res.json({error: 'invalid id'})
    else{
      let reqDate
      if(!req.body.date){
        let year = new Date().getUTCFullYear()
        let month = new Date().getUTCMonth()+1
        let day = new Date().getUTCDate()
        reqDate = year+'-'+month+'-'+day
        reqDate = new Date(reqDate).toDateString()
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

app.get('/api/users/:_id/logs', (req,res)=>{
  userModel.findById(req.params._id, (err,doc)=>{
    if(err) console.error(err)
    else{
      let myLogs = doc.log.map((item)=>{
        return{
          description: item.description,
          duration: item.duration,
          date: item.date
        }
      })
      res.json({
        _id: doc.id,
        username:doc.username,
        count: doc.count,
        log: myLogs
      })
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
