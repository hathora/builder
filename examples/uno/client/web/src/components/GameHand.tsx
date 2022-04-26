import { useHathoraContext } from "../context/GameContext";
import UnoCard from "./UnoCard";

export default function GameHand() {
  const { playerState, playCard, user, getUserName } = useHathoraContext();

  return (
    <div className="flex flex-col">
      <div className="text-lg font-semibold px-6">
        {user?.id === playerState?.turn && <span className="text-2xl">➡️</span>} {user?.id && getUserName(user?.id)}{" "}
        (You)
      </div>
      <div className="flex flex-row px-2 w-full overflow-x-auto hide-scroll-bar pb-8">
        <div className="flex flex-row">
          {playerState?.hand?.map((card) => (
            <UnoCard
              disabled={playerState?.turn !== user?.id}
              key={`${card.value}_${card.color}`}
              onClick={() => playCard(card)}
              color={card.color}
              value={card.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
