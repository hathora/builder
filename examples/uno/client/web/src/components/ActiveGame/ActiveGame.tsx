import CardPile from "../CardPile/CardPile";
import GameHand from "../GameHand/GameHand";
import { useHathoraContext } from "../../context/GameContext";

export default function ActiveGame() {
  const { drawCard } = useHathoraContext();

  return (
    <>
      <div className="flex justify-end items-end w-full pr-5">
        <button
          onClick={() => drawCard()}
          className="block bg-red-500 border border-red-400 rounded p-2 text-xl font-semibold text-white text-center hover:bg-red-600 h-fit"
        >
          Draw Card
        </button>
      </div>
      <CardPile />
      <GameHand />
    </>
  );
}
