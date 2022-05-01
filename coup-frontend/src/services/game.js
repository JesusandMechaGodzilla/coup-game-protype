import axios from 'axios'

const url = 'http://localhost:3001'

const postGame = (players) => {
    return axios.post(`${url}/start`,players).then(response=>response.data)
}
const preformAction =(player,actionMessage)=> {
    return axios.post(`${url}/action/${player}`,actionMessage).then(response=>response.data)
}

export default {postGame,preformAction} 
