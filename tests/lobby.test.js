const request = require('supertest');
const io = require('socket.io-client');
const app = require('../lobby.js');

describe('Socket.IO server', () => {
  let server; 
  let socket;

  beforeAll((done) => {
    server = app.listen(3001, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    socket = io.connect('http://localhost:3001', {
      reconnectionDelay: 0,
      forceNew: true,
      transports: ['websocket'],
    });
  });

  afterEach(() => {
    socket.disconnect();
  });

  describe('createLobby', () => {
    it('should create a new lobby with a random code', (done) => {
      socket.emit('createLobby', 'Test Lobby');
      socket.once('lobbyCreated', (lobby) => {
        expect(lobby.name).toBe('Test Lobby');
        expect(lobby.code).toBeDefined();
        done();
      });
    });
  });

  describe('joinLobby', () => {
    let lobbyCode;

    beforeEach((done) => {
      socket.emit('createLobby', 'Test Lobby');
      socket.once('lobbyCreated', (lobby) => {
        lobbyCode = lobby.code;
        done();
      });
    });

    it('should allow a player to join a lobby', (done) => {
      const playerName = 'Test Player';

      let socket2 = io.connect('http://localhost:3001', {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
      });
      socket2.emit('joinLobby', lobbyCode, playerName);
      socket2.once('playerJoined', (players) => {
        expect(players.length).toBe(2);
        expect(players[1].name).toBe(playerName);
        socket2.disconnect()
        done();
      });
    });

    it('should not allow a player to join a full lobby', (done) => {
      const playerName = 'Test Player';
      socketArray=[]
      for (let i = 0; i < 5; i++) {
        socketArray[i] = io.connect('http://localhost:3001', {
          reconnectionDelay: 0,
          forceNew: true,
          transports: ['websocket'],
        });
        socketArray[i].emit('joinLobby', lobbyCode, `Player ${i}`);
      }
    
      
      let socket3 = io.connect('http://localhost:3001', {
          reconnectionDelay: 0,
          forceNew: true,
          transports: ['websocket'],
        });
      socket3.emit('joinLobby', lobbyCode, playerName);
      socket3.once('lobbyError', (error) => {
        socket3.disconnect()
        socketArray.forEach(socket=>socket.disconnect())
        expect(error).toBe('Lobby is full');
        done();
      });
    });

    it('should not allow a player to join an invalid lobby', (done) => {
      const playerName = 'Test Player';
      socket.emit('joinLobby', 'invalidcode', playerName);
      socket.once('lobbyError', (error) => {
        expect(error).toBe('Invalid code');
        done();
      });
    });
  });

  describe('startGame', () => {
    let lobbyCode;

    beforeEach((done) => {
      socket.emit('createLobby', 'Test Lobby');
      socket.once('lobbyCreated', (lobby) => {
        lobbyCode = lobby.code;
        done();
      });
    });

    it('should start the game if the creator has enough players in the lobby', (done) => {
        const socket2 = io.connect('http://localhost:3001', {
          reconnectionDelay: 0,
          forceNew: true,
          transports: ['websocket'],
        });
        socket2.emit('joinLobby', lobbyCode, 'Player 2');
        socket2.once('playerJoined', () => {
          socket.emit('startGame', lobbyCode);
          socket.once('gameStarted', () => {
            socket2.disconnect()
            done();
          });
        });
    });

    it('should not start the game if the creator does not have enough players in the lobby', (done) => {
      socket.emit('startGame', lobbyCode);
      socket.once('lobbyError', (error) => {
        expect(error).toBe('Not enough players to start the game');
        done();
      });
    });

    it('should not start the game if a non-creator tries to start it', (done) => {
      const socket2 = io.connect('http://localhost:3001', {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
      });
      socket2.emit('joinLobby', lobbyCode, 'Player 2');
      socket2.once('playerJoined', () => {
        socket2.emit('startGame', lobbyCode);
        socket2.once('lobbyError', (error) => {
          socket2.disconnect()
          expect(error).toBe('Only the creator can start the game');
          done();
        });
      });
    });

    it('should not start the game if the code is invalid', (done) => {
      socket.emit('startGame', 'invalidcode');
      socket.once('lobbyError', (error) => {
        expect(error).toBe('Invalid code');
        done();
      });
    });
  });
});