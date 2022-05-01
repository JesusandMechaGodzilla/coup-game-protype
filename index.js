const express = require('express')
const Game = require('./game.js')
const cors = require('cors')
// const socketio = require('socket.io')
// const http = require('http')
const app = express()
app.use(cors())
// const server = http.createServer(app)
//const io = socketio(server)
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
app.use(express.json())
//  io.on('connection', socket =>{
//     console.log("connected")
//     socket.on("start", msg=>{
//         const body = msg
//         game = new Game(body.players,actions,{},cards)
//         game.dealCards()
        
//     })

//  })
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
  
const PORT = 3001
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})

