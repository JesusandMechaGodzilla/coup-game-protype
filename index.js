const express = require('express')
const Game = require('./game.js')
const app = express()
const cards = [
    {name:"contessa",action:null,reaction:"block_assasin"},
    {name:"duke",action:"tax",reaction:"block_foreign_aid"},
    {name:"assassin",action:"assassinate"},
    {name:"captain",action:"steal",reaction:"block_steal"},
    {name:"ambassador",action:"exchange",reaction:"block_steal"}
]
const actions = {
    income : (player) => {
        player.updatecoin(1)
    },
    foreign_aid : (player) => {
        player.updatecoin(2)
    },
    coup : (player,target) => {
        player.updatecoin(-7)

    }
}
app.use(express.json())
app.get('/',(req,res)=>{
    res.json(cards)
})
app.post('/start/',(req,res)=>{
    const body = req.body
    console.log(body)
    const game = new Game(body.players,actions,{},cards)
    game.dealCards()
    game.startTurn()
    res.json(game)
  })
  
const PORT = 3000
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})

