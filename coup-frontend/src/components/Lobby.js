import { useState, useEffect } from "react";
import GameService from "../services/GameServices.js";
import io from "socket.io-client";

const Lobby = ({setGameStart,setPlayers}) => {
  const [roomCode, setRoomCode] = useState(" ");
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState(null);
  const [members, setMembers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const handleRoomNumberChange = (e) => {
    console.log(e.target.value);
    setRoomCode(e.target.value);
  };

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
  };
  const displayErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(room).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 5000);
    })
  };
  useEffect(() => {
    if (socket) {
      const lobbyMembersListener = (players) => {
        setMembers(players);
      };

      socket.on("playerJoined", lobbyMembersListener);

      return () => {
        socket.off("playerJoined", lobbyMembersListener);
      };
    }
  }, [socket, room]);

  useEffect(() => {
    const socket = io.connect("http://localhost:3001", {
      reconnectionDelay: 0,
      forceNew: true,
      transports: ["websocket"],
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = () => {
    if (playerName.trim() === "") {
      displayErrorMessage("Please enter a name before creating a room.");
    } else {
      setErrorMessage(null);
      GameService.createRoom(setRoom,socket,setMembers,setCreatorId,playerName);
    }
  };

  const joinRoom = () => {
    if (playerName.trim() === "") {
      displayErrorMessage("Please enter a name before joining a room.");
    } else {
      setErrorMessage(null);
      GameService.joinRoom(roomCode,setRoom,socket,setMembers,playerName);
    }
  };
  const startGame = () => {
    
    if(members.length < 3){
        displayErrorMessage("Must have atleast 3 players to play.");
    } else {
      setErrorMessage(null);
      setPlayers(GameService.createGamePlayers(members))
      setGameStart(true)
    }
  };

  if (!room) {
    return (
      <div>
        <h2>Create or join a room</h2>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <div>
          <button style={{ margin: "5px" }} onClick={createRoom}>
            Create
          </button>
        </div>
        <input
            value={playerName}
            onChange={handlePlayerNameChange}
            placeholder="Your name"
          />
        <div>
          <input value={roomCode} onChange={handleRoomNumberChange} />
          <button onClick={joinRoom}>join</button>
        </div>
      </div>
    );
  } else {
    return (
        <div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <h2>Members in the lobby:</h2>
        <ul>
          {members.map((member) => (
            <li key={member.id}>{member.name}</li>
          ))}
        </ul>
        <p>
          Join code: <strong>{room}</strong>
        </p>
        <p>Click the button below to copy the code:</p>
        <button onClick={copyCodeToClipboard}>
          {copied ? "Copied!" : "Copy code"}
        </button>
        <br></br>
        {socket.id === creatorId && (
          <button onClick={startGame}>Start Game</button>
        )}
      </div>
    );
  }
};

export default Lobby;