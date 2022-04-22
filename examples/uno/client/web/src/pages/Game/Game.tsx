import { useParams } from "react-router-dom";
import { useHathoraContext } from "../../context/AuthContext";
import { useEffect, useLayoutEffect } from "react";

export default function Game() {
  const { gameId } = useParams();
  const { disconnect, joinGame, playerState, token, login, startGame } = useHathoraContext();

  useLayoutEffect(() => {
    // if user is not logged in but someone shared the link log them in
    if (!token) {
      login();
    }
  }, [token]);

  useEffect(() => {
    // auto join the game once on this page
    if (gameId && token) {
      joinGame(gameId);
    }
    return disconnect;
  }, [gameId, token]);

  useEffect(() => {
    if (playerState?.players?.length >= 2) {
      console.log("calling start game");
      startGame(gameId);
    }
  }, [playerState?.players.length, gameId]);

  return (
    <div>
      <div>{JSON.stringify(playerState)}</div>
      <button>Start Game</button>
    </div>
  );
}
