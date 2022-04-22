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
    <div className="flex flex-row h-full">
      <div className="w-64 flex flex-col overflow-y-auto bg-slate-200 p-5">
        <h2 className="text-5xl tracking-tight font-bold text-gray-900">Players</h2>
        <div className="pt-5">
          {playerState?.players.map((player) => (
            <div
              key={player}
              className={`bg-slate-500 text-white shadow  shadow-gray-600 p-3 rounded mb-2 ${
                player === playerState?.turn ? "bg-orange-500" : ""
              }`}
            >
              {player}
            </div>
          ))}
        </div>
      </div>
      <div className="pt-5 flex-5 flex-col">
        <div className="pile-row flex justify-center items-center h-1/2">
          {playerState?.pile?.color} {playerState?.pile?.value}
        </div>
        <div className="hand-row flex justify-center items-center h-1/2">{JSON.stringify(playerState?.hand)}</div>
        <div>{JSON.stringify(playerState)}</div>
        <button>Start Game</button>
      </div>
    </div>
  );
}
