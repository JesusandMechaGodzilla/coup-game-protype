const express = require('express')
const cors = require('cors')
const http = require('http')
const app = express()
app.use(cors())
app.use(express.json())
const server = http.createServer(app)
const io = require('socket.io')(server,{
    cors: {
        origin: '*',
      }
})
let lobbies = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Create new lobby
  socket.on('createLobby', (lobbyName,creatorName) => {
    const code = Math.floor(100000 + Math.random() * 900000); // Generate random code
    const lobby = {
      name: lobbyName,
      code: code,
      creatorId: socket.id,
      players: [{id: socket.id, name: creatorName}]
    };
    lobbies.push(lobby);
    socket.join(code);
    console.log(`Lobby Created with createorid: ${lobby.creatorId} and lobbyName ${lobby.name} and lobby code ${lobby.code}`)
    socket.emit('lobbyCreated', lobby); // Send lobby information back to creator
  });


socket.on('joinLobby', (code, playerName) => {
  console.log(code)
  const lobby = lobbies.find((lobby) => lobby.code === code);
  console.log(lobbies)
  if (!lobby) {
    socket.emit('lobbyError', 'Invalid code');
  } else if (lobby.players.length >= 6) {
    socket.emit('lobbyError', 'Lobby is full');
  } else {
    console.log(`Attempting to join lobby with createorid: ${lobby.creatorId} and lobbyName ${lobby.name} and lobby code ${lobby.code}`)
    socket.join(code);
    lobby.players.push({id: socket.id, name: playerName});
    io.to(code).emit('playerJoined', lobby.players); // Send updated player list to all players in the lobby
  }
});

socket.on('startGame', (code) => {
const lobby = lobbies.find((lobby) => lobby.code === code);
if (!lobby) {
  socket.emit('lobbyError', 'Invalid code');
} else if (lobby.creatorId !== socket.id) {
  socket.emit('lobbyError', 'Only the creator can start the game');
} else if (lobby.players.length < 2) {
  socket.emit('lobbyError', 'Not enough players to start the game');
} else {
  socket.emit('gameStarted')
  console.log("Game started!")
}
});

socket.on('lobbyMembers', (code) => { 
  const lobby = lobbies.find((lobby) => lobby.code === code);
  if (!lobby) {
    socket.emit('lobbyError', 'Invalid code');
  }
  else {
    socket.emit('membersFetched')

  }
});


});


module.exports = server
