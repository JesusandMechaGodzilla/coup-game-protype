const express = require('express')
const Game = require('./game.js')
const socketio = require('socket.io')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const cards = [
    {name:"contessa",action:null,reaction:"block_assasin"},
    {name:"duke",action:"tax",reaction:"block_foreign_aid"},
    {name:"assassin",action:"assassinate"},
    {name:"captain",action:"steal",reaction:"block_steal"},
    {name:"ambassador",action:"exchange",reaction:"block_steal"}
]
const actions = {
    income : (player,game,...args) => {
        game.players[player].coins++
    },
    foreign_aid : (player,game,...args) => {
        game.players[player].coins +=  2
    },
    coup : (player,target,game,...args) => {
        game.players[player].coins -= 7
        delete game.players[target]

    },
    tax : (player,game,...args) => {
        game.players[player].coins +=3
    },
    assassinate: (player,target,game,...args) => {
        game.players[player].coins -=3
        delete game.players[target]
    },
    steal: (player,target,game,...args) => {
        game.players[player].coins +=2
        game.players[target].coins -=2
    },
    exchange: (player,game,...args) => {
        let cardsToReplace = args[0].choice ? args[0].choice : null 
        let cardsToPutBackInDeck = args[0].replace ? args[0].replace : null 
        if(game.state === Game.GameState.choice){
             game.state = Game.GameState.execution
             return game.deck.splice(0,2)
        }
        else {
            game.players[player].influences = cardsToReplace
            game.deck.push(...cardsToPutBackInDeck)
            game.shuffle(game.deck)
            game.state = Game.GameState.choice
        }
    }
}

let game = null
app.use(express.json())
 io.on('connection', socket =>{
    console.log("connected")
    socket.on("start", msg=>{
        const body = msg
        game = new Game(body.players,actions,{},cards)
        game.dealCards()
        console.log(game)
    })
 })
app.get('/',(req,res)=>{
    res.json(cards)
})
app.post('/start/',(req,res)=>{
    const body = req.body
    game = new Game(body.players,actions,{},cards)
    game.dealCards()
    res.json(game)
  })

app.post('/action/:id',(req,res)=>{
    const body = req.body
    const player = req.params.id
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
  
const PORT = 3000
server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})

