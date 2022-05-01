import { useState,useEffect } from "react";
import Actions from "./Actions";
import Players from "./Players";
import GameService from '../services/game.js'

function TestGameScreen() {
  const updateGameNextTurn = () => {
    let nextTurnIndex = game.players.findIndex(player => player.name === playersTurn.name) + 1
    nextTurnIndex = nextTurnIndex >= game.players.length ?  0 : nextTurnIndex 
    setNextPlayersTurn(game.players[nextTurnIndex])
}
  const players = [
    {
      name:"player1",
      coins: 2,
      influences:[]
    },
    {
      name:"player2",
      coins: 2,
      influences:[]
    }
  ]
  const [game,setGame] = useState({players:players})
  const [gameState,setGameState] = useState({name:"action",action:null})
  const [cardChoice,setCardChoice] = useState([]);
  useEffect(() =>{
    GameService
    .postGame({players:players})
    .then(data=>{
      setGame(data)
    })
  },[])
  useEffect(()=>{
    updateGameNextTurn()
  },[game])
  const [playersTurn,setNextPlayersTurn] = useState(players[players.length-1])
  const actions = [{name:"income",cost:0},{name:"foregin aid",cost:0},{name:"coup",cost:7},
  {name:"tax",cost:0},{name:"assassinate",cost:3},{name:"steal",cost:0},{name:"exchange",cost:0}]
  return (
    <div>
      <Players players={game.players}></Players>
      <p>Current Players Turn: {playersTurn.name}</p>
      <Actions actions={actions} playersTurn={playersTurn}
      game={game} setGame={setGame} gameState={gameState} setGameState={setGameState} cardChoice={cardChoice}
      setCardChoice={setCardChoice}>
      </Actions>
    </div>
  );
}

export default TestGameScreen;
