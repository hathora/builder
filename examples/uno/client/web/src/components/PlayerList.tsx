import { useHathoraContext } from "../context/GameContext";
import MiniCardsRow from "./MiniCard";

export default function PlayerList() {
  const { playerState, user, getUserName } = useHathoraContext();
  return (
    <div className="pt-3 flex flex-row">
      {playerState?.players.map((player) => (
        <div
          key={player.id}
          className={`bg-slate-500 text-white shadow shadow-gray-600 p-3 rounded mb-2 mx-2 ${
            player.id === playerState?.turn ? "bg-green-600" : ""
          }`}
        >
          {getUserName(player.id)} {player.id === user?.id ? "(You)" : ""}
          <div className="mt-5 flex items-end">
            <MiniCardsRow count={player.numCards} />
          </div>
          <div className="flex justify-end">
            <strong>{player.id === playerState?.turn ? "Current player" : ""}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
