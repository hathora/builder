import React from "react";
import { useHathoraContext } from "../context/GameContext";

export default function ActivePot() {
  const { playerState } = useHathoraContext();

  const pot = playerState?.players?.reduce((accum, player) => accum + player.chipsInPot, 0) ?? 0;

  return (
    <div className="w-full">
      <div className="border mx-5 px-5 py-3 rounded bg-white shadow drop-shadow">
        <div className="lg:text-xl font-bold">Current Pot</div>
        <div>${pot}</div>
      </div>
    </div>
  );
}
