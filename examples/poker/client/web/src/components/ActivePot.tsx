import React from "react";
import { useHathoraContext } from "../context/GameContext";

export default function ActivePot() {
  const { playerState, user } = useHathoraContext();

  const pot = playerState?.players?.reduce((accum, player) => accum + player.chipsInPot, 0) ?? 0;
  const currentUser = playerState?.players.find((player) => player.id === user?.id);

  return (
    <div className="flex w-full lg:w-1/2 mb-5">
      <div className="border w-1/2 px-5 py-3 rounded mx-2 bg-white shadow drop-shadow">
        <div className="lg:text-xl font-bold">Current Pot</div>
        <div>${pot}</div>
      </div>
      <div className="border w-1/2 px-5 py-3 rounded mx-2 bg-white shadow drop-shadow">
        <div className="lg:text-xl font-bold">Current Balance</div>
        <div>
          ${currentUser?.chipCount} <span className="lg:font-md text-gray-600">(${currentUser?.chipsInPot ?? 0})</span>
        </div>
      </div>
    </div>
  );
}
