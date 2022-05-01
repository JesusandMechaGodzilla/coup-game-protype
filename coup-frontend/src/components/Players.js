import React from 'react'

export default function Players({players}) {
   const ListPlayerInfo = (players) => {
        return players.map(player => {

            return ( 
            <li key={player.name}>
                <p>{player.name}: {player.influences.map(influence => <span>{influence}  </span> )}</p> 
                <p>coins: {player.coins}</p>
            </li>
            )
            });
    }
  return (
    <div>
    <ul style={{listStyleType: 'none',paddingLeft:'0px'}}>
        {ListPlayerInfo(players)}
    </ul>
    </div>
  )
}
