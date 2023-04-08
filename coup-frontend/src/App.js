import { useState} from "react";
import TestGameScreen from "./components/TestGameScreen";
import Lobby from "./components/Lobby";
const App =()=>{
    const [isgameStarted, setGameStart] = useState(false)
    const [players,setPlayers] = useState([])
    if(isgameStarted){
        return(
            <div><TestGameScreen players={players}/></div>
        )
    }
    else {
        return(<div><Lobby setGameStart={setGameStart} setPlayers={setPlayers}  /></div>)
    }
}
export default App