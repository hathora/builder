import UnoCard from "../UnoCard/UnoCard";
import { useHathoraContext } from "../../context/GameContext";

export default function CardPile() {
  const { playerState } = useHathoraContext();

  const pile = playerState?.pile;

  return (
    <div className="flex justify-center items-center h-1/2 overflow-scroll flex-col">
      <div className="text-lg font-semibold">Pile</div>
      {pile?.color !== undefined && pile?.value && <UnoCard color={pile?.color} value={pile?.value} />}
    </div>
  );
}
