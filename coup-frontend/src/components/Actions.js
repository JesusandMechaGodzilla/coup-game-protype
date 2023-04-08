import React from 'react'
import GameService from '../services/GameServices.js'
export default function Actions({actions,game,playersTurn,setGame,gameState,setGameState,cardChoice,setCardChoice}) {
    const executeAction = (action,target,cards) => () => {
        switch(action.name) {
            case "income" : GameService.preformAction(playersTurn.name,{action:"income"}).then(data=>setGame(data));break
            case "foreign aid" : GameService.preformAction(playersTurn.name,{action:"foreign_aid"}).then(data=>setGame(data));break
            case "tax" : GameService.preformAction(playersTurn.name,{action:"tax"}).then(data=>setGame(data));break
            case "coup":
            if(gameState.name === "playerChoice"){
                GameService.preformAction(playersTurn.name,{action:"coup",target:target}).then(data=>setGame(data));
                setGameState({name:"action",action:null})
            }
            else {
                setGameState({name:"playerChoice",action:"coup"})
            }
            break
            case "assassinate": 
            if(gameState.name === "playerChoice"){
                GameService.preformAction(playersTurn.name,{action:"assassinate",target:target}).then(data=>setGame(data));
                setGameState({name:"action",action:null})
            }
            else {
                setGameState({name:"playerChoice",action:"assassinate"})
            }
            break
            case "steal":
                if(gameState.name === "playerChoice"){
                    GameService.preformAction(playersTurn.name,{action:"steal",target:target}).then(data=>setGame(data));
                    setGameState({name:"action",action:null})
                }
                else {
                    setGameState({name:"playerChoice",action:"steal"})
                }
            break
            case "exchange":
                if(gameState.name === "cardChoice"){
                    GameService.preformAction(playersTurn.name,{action:"exchange",choice:cards.choice,replace:cards.replace}).then(data=>setGame(data));
                    setGameState({name:"action",action:null,cards:null})
                }
                else {
                    GameService.preformAction(playersTurn.name,{action:"exchange"}).then(data=>{
                        const card = game.players.find(player=>player.name===playersTurn.name).influences.concat(...data)
                        setGameState({name:"cardChoice",action:"exchange",cards:card})
                    })
                }
            break
            default: GameService.preformAction(playersTurn.name,{action:"income"}).then(data=>setGame(data))
        }


        
    }
    const handleCardChoice = (card,influences) => () => {
       
        const cardsChosen = cardChoice.concat(card)
        setCardChoice(cardsChosen)
        const cardsLeftToChoose = gameState.cards
        console.log(cardsChosen)
        cardsLeftToChoose.splice(cardsLeftToChoose.findIndex(cardInArray=>cardInArray===card),1)
        console.log(cardsLeftToChoose)
        setGameState({cards:cardsLeftToChoose,...gameState})
        if(cardsChosen.length === influences.length){
        
            const cards = {choice:cardsChosen,replace:cardsLeftToChoose}
            executeAction({name:"exchange"},null,cards).call()
            setCardChoice([])
        }
    }

    const ListPossibleActions = (actions) =>{
        const stealablePlayers = game.players.filter(player => player.coins >= 2 && player.name !== playersTurn.name)
        if (gameState.name === "action"){
        return (
         actions.map(action=>{
            const canPreformAction = action.name === "steal" ? !!(stealablePlayers.length) : playersTurn.coins >= action.cost
            if(canPreformAction){
            return (
             <button key={action.name} style={{margin:'5px'}}onClick={executeAction(action,null)}>{action.name}</button>
             )
        }
        })
        )
    }
    else if(gameState.name === "playerChoice"){
        const players = gameState.action !=="steal" ? game.players : stealablePlayers
       return( players.map(player=>{
            if(player.name !== playersTurn.name){
            return(
            <button key={player.name} style={{margin:'5px'}} onClick={executeAction({name:gameState.action},player.name)}>{player.name}</button>
            )}
    }))
    }
    else if(gameState.name==="cardChoice"){
        const influences =game.players.find(player=>player.name===playersTurn.name).influences
        let id = 0
        return( 
            <div>
            <p>Pick which card(s) you want to keep</p>
            {gameState.cards.map(card=>{
             id++
            return(<button key={id} style={{margin:'5px'}} onClick={handleCardChoice(card,influences)}>{card}</button>
            )})}
            <p>Card(s) chosen: {cardChoice.map(card=><span>{card} </span>)}</p>
            </div>
        )
}
}
  return (
    <div>{ListPossibleActions(actions)}</div>
  )
}


