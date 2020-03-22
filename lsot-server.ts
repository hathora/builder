import socketio from "socket.io";
import impl from "./lsot-impl";

const users = {};
const states = {};

socketio(3000).on("connection", socket => {
  socket.on("registerUser", (userData, callback) => {
    const userId = Math.random()
      .toString(36)
      .substring(2);
    users[userId] = userData;
    callback(userId);
  });
  socket.on("new", userId => {
    const stateId = Math.random()
      .toString(36)
      .substring(2);
    const userData = users[userId];
    const state = impl.createGame(userData);
    states[stateId] = state;
  });

  socket.on("startGame", (userId, stateId, roleList, playerOrder) => {
    const state = states[stateId];
    const userData = users[userId];
    impl.startGame(state, userData, roleList, playerOrder);
  });
  socket.on("proposeQuest", (userId, stateId, questId, proposedMembers) => {
    const state = states[stateId];
    const userData = users[userId];
    impl.proposeQuest(state, userData, questId, proposedMembers);
  })
  socket.on("voteForProposal", (userId, stateId, questId, vote) => {
    const state = states[stateId];
    const userData = users[userId];
    impl.voteForProposal(state, userData, questId, vote);
  })
  socket.on("voteInQuest", (userId, stateId, questId, vote) => {
    const state = states[stateId];
    const userData = users[userId];
    impl.voteInQuest(state, userData, questId, vote);
  })
});
