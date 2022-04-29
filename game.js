
 class Game {
     constructor(players, actions, challenges,reactions,cards) {
        this.players = players
        this.actions = actions
        this.challenges = challenges
        this.reactions = reactions
        this.cards = cards
        this.deck = this.buildDeck(cards)
        this.state = Game.GameState.choice
    }
    static GameState = {
        start : Symbol('start'),
        choice : Symbol('choice'),
        execution : Symbol('execution')
    }
    shuffle(deck) {
        return deck.sort(() => Math.random() - 0.5)
    }
    buildDeck(cards) {
        let deck = []
        cards.forEach(card => deck.push(...Array(3).fill(card.name)))
        deck = this.shuffle(deck)
        return deck;
    }
    dealCards(){
        for (const player in this.players){
            this.players[player].influences.push(this.deck.splice(0,2))

        }
    }

    startGame() {
        dealCards()
        startTurn()    
    }

    startTurn() {
        return null
    }
    executeAction(player,target,action,...args) {
        if(target){
            console.log(this)
            return this.actions[action](player,target,this,...args)
        }
        else {
            return this.actions[action](player,this,...args)
        }
    }
    executeChallenge(player, target, action, ...args){
        console.log(this)
        return this.challenges[action](player, target, this, ...args)

    }

}
module.exports = Game

