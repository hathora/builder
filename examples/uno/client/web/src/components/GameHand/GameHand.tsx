import UnoCard from "../UnoCard/UnoCard";
import { useHathoraContext } from "../../context/GameContext";

export default function GameHand() {
  const { playerState, playCard, user, getUserName } = useHathoraContext();

  return (
    <div className="flex flex-col justify-center items-center pb-5">
      <div className="text-lg font-semibold text-center">
        {user?.id === playerState?.turn && <span className="text-2xl">➡️</span>} {user?.id && getUserName(user?.id)}{" "}
        (You)
      </div>
      <div className="hand-row flex max-w-full flex-wrap h-full pb-10 items-center justify-center">
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
  );
}
