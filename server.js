const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')


app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {

    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)

    socket.on('message',message=>{
      io.to(roomId).emit('createMessage',message)
    })
    let recJoined=true;
    socket.on('check-recruit',recStatus=>{
      console.log(recJoined);
      if(recJoined!==recStatus){
        io.to(roomId).emit('rec-status',recJoined)
      }
    })

    
    socket.on('dispQ',Qno=>{
      io.to(roomId).emit('displayedQ',Qno)
    })
    socket.on('addNewQ',obj=>{
      io.to(roomId).emit('newQ',obj)
    })
    socket.on('answerSubmitted',ans=>{
      io.to(roomId).emit('submittedAns',ans)
    })
    socket.on('testEnd',x=>{
      console.log('test ended');
      io.to(roomId).emit('endedTest',x)
    })

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT || '3000')
