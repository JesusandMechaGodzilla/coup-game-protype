import axios from 'axios'


const url = "http://localhost:3001"
const createRoom = (setRoom,socket,setMembers,setCreatorId,playerName) => {
   socket.emit('createLobby', 'Test Lobby',playerName);
    socket.once('lobbyCreated', (lobby) =>{
       setRoom(lobby.code)
       setMembers(lobby.players)
       setCreatorId(socket.id)
    })
   
}
const joinRoom = (roomCode,setRoom,socket,setMembers,playerName) => {
      socket.emit('joinLobby', Number(roomCode), playerName);
      socket.once('lobbyError', (error) => {
        setRoom(error)
      })
      socket.once('playerJoined', (players) => {
        setRoom(roomCode)
        setMembers(players)
      });
}

const createGamePlayers =(players)=>{
  return players.map(name => {
    return {
      name: name.name,
      coins: 2,
      influences: []
    };
  });
}

const postGame = (players) => {
    return axios.post(`${url}/start`,players).then(response=>response.data)
}
const preformAction =(player,actionMessage)=> {
    return axios.post(`${url}/action/${player}`,actionMessage).then(response=>response.data)
}

export default {postGame,preformAction,createRoom,joinRoom,createGamePlayers} 
