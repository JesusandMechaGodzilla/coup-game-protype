 class Game {
    constructor(players, actions,reactions,cards) {
        this.players = players
        this.actions = actions
        this.reactions = reactions
        this.deck = this.buildDeck(cards)
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
        
    }

}
module.exports = Game

