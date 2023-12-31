const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// Add a route to serve your chess.js module
app.get('/node_modules/chess.js/dist/esm/chess.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/chess.js/dist/esm/chess.js'));
  });

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

const connections = [null, null]
// Handle a socket connection
io.on('connection', socket => {
    // console.log('New WS Connection')

    // Find an available player number
    let playerIndex = -1;
    for (const i in connections){
      if(connections[i] === null){
        playerIndex = i
        break
      }
    }

    // Tell the connecting client what player number they are
    socket.emit('player-number', playerIndex)

    console.log(`Player ${playerIndex} has connected`)

    // Ignore player 3
    if (playerIndex === -1){
      console.log("3rd player reject")
      return
    }

    // Tell everyone what player number just connected
    socket.broadcast.emit('player-connection', playerIndex)
    connections[playerIndex] = true

    // Handle Disconnect
    socket.on('disconnect', () => {
      console.log(`Player ${playerIndex} disconnected`)
      connections[playerIndex] = null
      // Tell everyone what player disconnected
      socket.broadcast.emit('player-connection', playerIndex)
    })

    //Check player connections
    socket.on('check-players', () => {
      const players = []
      for (const i in connections) {
        connections[i] === null ? players.push({connected: false}) : 
        players.push({connected: true})
      }
      socket.emit('check-players', players)
    })

    // On Opponent Move
    socket.on('move', move => {
      console.log(`Chess move from ${playerIndex}` + " moving from " + move[0] + " to " + move[1])

      // Emit the move to the other player
      socket.broadcast.emit('move', move)
    })
})