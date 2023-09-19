import { Chess } from '/node_modules/chess.js/dist/esm/chess.js'
// import { io } from "socket.io-client";
let currentPlayer = 'white';
let playerNum = 0;
let ready = false;
let enemyReady = false;

var playerone = document.getElementsByClassName('player1');
var playertwo = document.getElementsByClassName('player2');

const socket = io();
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var whiteSquareGrey = '#18453B'
var blackSquareGrey = '#4B5320'

// Get your player number
socket.on('player-number', num => {
  if (num === -1) {
    entirefuckingscreen.innerHTML = "Server is full..."
  }
  else{
    playerNum = parseInt(num)
    if(playerNum === 1){
      currentPlayer = "black"
    }
    console.log(playerNum)

    // Get other player status
    socket.emit('check-players')
    config();
  }
})

//Another player has connected or disconnected
socket.on('player-connection', num => {
  console.log(`Player number ${num} has connected or disconnected`)
  playerConnectedOrDisconnected(num)
})

// Check player status
socket.on('check-players', players => {
  players.forEach((p, i) => {
    if(p.connected) playerConnectedOrDisconnected(i)
  })
})

function playerConnectedOrDisconnected(num) {
  let player = '.player1';
  if(parseInt(num) === 0){
    player = '.player1'
  }
  else if(parseInt(num) === 1){
    player = '.player2'
  }
  else{
    console.log('else');
    return;
  }
  console.log('here');
  document.querySelector(`${player} .connected span`).classList.toggle('green')
  if(parseInt(num) === playerNum) document.querySelector('.player1').style.fontWeight = 'bold'
}

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}


function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  if((currentPlayer === 'white' && game.turn() === 'w') || (currentPlayer === 'black' && game.turn() === 'b')){
    var moves = game.moves({
      square: square,
      verbose: true
    })

    // exit if there are no moves available for this square
    if (moves.length === 0) return

    // highlight the square they moused over
    greySquare(square)

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to)
    }
}
}


function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.isGameOver()) return false

  // only pick up pieces for the side to move
  // if white player
  if(currentPlayer === 'white'){
    if ((piece.search(/^b/) !== -1)) {
      return false
    }
  }
  // if black player
  else if(currentPlayer === 'black'){
    if ((piece.search(/^w/) !== -1)) {
      return false
    }
  }
  else{
    return false
  }
}


function onDrop (source, target) {
  // see if the move is legal
  var move = null;
  try{
    move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
  }
  catch(error){
    return 'snapback'
  }

  // Setup even listeners for chess movement
  console.log(source + " " + target);
  let moveArray = [source, target];
  socket.emit('move', moveArray);

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.isCheckmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.isDraw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.inCheck()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())

  
}

function config () {
  let orientation = 'white';
  if(currentPlayer === 'black'){
    orientation = 'black';
    playerone[0].innerHTML = 'Black player <div class="connected">Connected <span></span></div>'
    playertwo[0].innerHTML = 'White player <div class="connected">Connected <span></span></div>'
  }
  var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    dropOffBoard: 'snapback',
    orientation: orientation
  }
  board = Chessboard('myBoard', config)
  $('#clearBtn').on('click', board.clear)

  $('#startBtn').on('click', board.start)
}


updateStatus()