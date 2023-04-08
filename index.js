const express = require('express')
const Game = require('./game.js')
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
const cards = [
    {name:"contessa",action:null,reaction:"block_assasin"},
    {name:"duke",action:"tax",reaction:"block_foreign_aid"},
    {name:"assassin",action:"assassinate"},
    {name:"captain",action:"steal",reaction:"block_steal"},
    {name:"ambassador",action:"exchange",reaction:"block_steal"}
]
const reactions = {
    block_assasin: (player, target, game, ...args) => {

    },
    block_foreign_aid: (player, target, game, ...args) => {

    },
    block_steal: (player, target, game, ...args) => {

    }
}

const challenges = {
    challenge : (player, target, game, ...args)=>{

    },
    tax: (player, target, game, ...args) => {
        if (game.players[target].influences[0].includes("duke")){
            game.players[target].influences[0].splice(game.players[target].influences[0].indexOf("duke"), 1)
            game.deck.push("duke")
            game.shuffle(game.deck)
            game.players[target].influences[0].push(game.deck.pop())
            delete game.players[player]
        }
        else {
            delete game.players[target]
        }
    },
    assassinate: (player, target, game, ...args) => {
        if (game.players[target].influences[0].includes("assassin")) {
            game.players[target].influences[0].splice(game.players[target].influences[0].indexOf("assassin"), 1)
            game.deck.push("assassin")
            game.shuffle(game.deck)
            game.players[target].influences[0].push(game.deck.pop())
            delete game.players[player]
        }
        else {
            delete game.players[target]
        }
    },
    steal: (player, target, game, ...args) => {
        if (game.players[target].influences[0].includes("captain")) {
            game.players[target].influences[0].splice(game.players[target].influences[0].indexOf("captain"), 1)
            game.deck.push("captain")
            game.shuffle(game.deck)
            game.players[target].influences[0].push(game.deck.pop())
            delete game.players[player]
        }
        else {
            delete game.players[target]
        }
    },
    exchange: (player, target, game, ...args) => {
        if (game.players[target].influences[0].includes("ambassador")) {
            game.players[target].influences[0].splice(game.players[target].influences[0].indexOf("ambassador"), 1)
            game.deck.push("ambassador")
            game.shuffle(game.deck)
            game.players[target].influences[0].push(game.deck.pop())
            delete game.players[player]
        }
        else {
            delete game.players[target]
        }
    }

}


const actions = {
    income : (player,game,...args) => {
        game.players.find(playerToFind => player === playerToFind.name).coins++
    },
    foreign_aid : (player,game,...args) => {
        game.players.find(playerToFind => player ===playerToFind.name).coins +=  2
    },
    coup : (player,target,game,...args) => {
        game.players.find(playerToFind => player === playerToFind.name).coins -= 7
        const targetIndex = game.players.findIndex(playerToFind => target === playerToFind.name)
        console.log(game.players[targetIndex].influences.length)
        if(game.players[targetIndex].influences.length === 2){
            game.players[targetIndex].influences.pop()
        }
        else {
            game.players.splice(targetIndex,1)
        }

    },
    tax : (player,game,...args) => {
        game.players.find(playerToFind => player ===playerToFind.name).coins +=3
    },
    assassinate: (player,target,game,...args) => {
        game.players.find(playerToFind => player === playerToFind.name).coins -= 3
        const targetIndex = game.players.findIndex(playerToFind => target === playerToFind.name)
        console.log(game.players[targetIndex].influences.length)
        if(game.players[targetIndex].influences.length === 2){
            game.players[targetIndex].influences.pop()
        }
        else {
            game.players.splice(targetIndex,1)
        }
    },
    steal: (player,target,game,...args) => {
        game.players.find(playerToFind => player ===playerToFind.name).coins +=2
        game.players.find(playerToFind => target ===playerToFind.name).coins -=2
    },
    exchange: (player,game,...args) => {
        let cardsToReplace = args[0].choice ? args[0].choice : null 
        let cardsToPutBackInDeck = args[0].replace ? args[0].replace : null 
        if(game.state === Game.GameState.choice){
             game.state = Game.GameState.execution
             return game.deck.splice(0,2)
        }
        else {
            game.players.find(playerToFind => player ===playerToFind.name).influences = cardsToReplace
            game.deck.push(...cardsToPutBackInDeck)
            game.shuffle(game.deck)
            game.state = Game.GameState.choice
        }
    }
}

let game = null

app.get('/',(req,res)=>{
    res.json(cards)
})
app.post('/start/',(req,res)=>{
    const body = req.body
    game = new Game(body.players,actions,challenges,{},cards)
    game.dealCards()
    res.json(game)
  })

app.post('/action/:id',(req,res)=>{
    const body = req.body
    const player = req.params.id
    console.log(body)
    let response = game
    if(body.target){
        response = game.executeAction(player,body.target,body.action,body)
    }
    else {
        response = game.executeAction(player,null,body.action,body)
    }
    response  = response ? response : game  
    res.json(response)
})
app.post('/challenge/:id', (req, res) => {
    const body = req.body
    const player = req.params.id
    let response = game
    response = game.executeChallenge(player, body.target, body.action, body)
    response = response ? response : game
    res.json(response)
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
  
module.exports = server;


