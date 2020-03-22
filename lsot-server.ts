import socketio from "socket.io";
import impl from "./lsot-impl";

const users: Map<string, any> = new Map();
const states: Map<string, any> = new Map();
const connections: Map<string, Set<SocketIO.Socket>> = new Map();

const io = socketio(3000);

io.on("connection", socket => {
  const stateId = socket.handshake.query.stateId;
  const userId = socket.handshake.query.userId;
  const state = states.get(stateId);
  const userData = users.get(userId);
  addConnection(stateId, socket);
  socket.on("disconnect", () => {
    deleteConnection(stateId, socket);
  });

  socket.on("joinGame", () => {
    impl.joinGame(state, userData);
    broadcastUpdates(stateId, state);
  });
  socket.on("startGame", (roleList, playerOrder) => {
    impl.startGame(state, userData, roleList, playerOrder);
    broadcastUpdates(stateId, state);
  });
  socket.on("proposeQuest", (questId, proposedMembers) => {
    impl.proposeQuest(state, userData, questId, proposedMembers);
    broadcastUpdates(stateId, state);
  });
  socket.on("voteForProposal", (questId, vote) => {
    impl.voteForProposal(state, userData, questId, vote);
    broadcastUpdates(stateId, state);
  });
  socket.on("voteInQuest", (questId, vote) => {
    impl.voteInQuest(state, userData, questId, vote);
    broadcastUpdates(stateId, state);
  });
});

function addConnection(stateId: string, socket: socketio.Socket) {
  if (!connections.has(stateId)) {
    connections.set(stateId, new Set([socket]));
  } else {
    connections.get(stateId).add(socket);
  }
}

function deleteConnection(stateId: string, socket: SocketIO.Socket) {
  connections.get(stateId).delete(socket);
  if (connections.get(stateId).size === 0) {
    connections.delete(stateId);
  }
}

function broadcastUpdates(stateId: string, state) {
  connections.get(stateId).forEach(socket => {
    const userId = socket.handshake.query.userId;
    const userData = users.get(userId);
    const userState = impl.getUserState(state, userData);
    socket.emit("state", userState);
  });
}
