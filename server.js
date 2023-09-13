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
server.listen(PORT, () => console.log('Server running on port ${PORT}'))

// Handle a socket connection
io.on('connection', socket => {
    console.log('New WS Connection')
})