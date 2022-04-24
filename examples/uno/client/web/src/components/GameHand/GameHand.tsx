import UnoCard from "../UnoCard/UnoCard";
import { useHathoraContext } from "../../context/GameContext";

export default function GameHand() {
  const { playerState, playCard, user } = useHathoraContext();

  return (
    <div className="h-1/2 flex flex-col justify-center items-center pb-10">
      <div className="text-lg font-semibold">Current Hand</div>
      <div className="hand-row flex max-w-full flex-wrap h-full pb-44">
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
