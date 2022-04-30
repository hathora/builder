import { useHathoraContext } from "../context/GameContext";
import UnoCard from "./UnoCard";
import SideDownUno from "./SideDownUno";

export default function CardPile() {
  const { playerState, drawCard } = useHathoraContext();

  const pile = playerState?.pile;

  return (
    <div className="flex justify-center items-center mb-10 overflow-scroll flex-col">
      <div className="flex">
        {pile?.color !== undefined && pile?.value && (
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-center">Pile</div>
            <UnoCard color={pile?.color} value={pile?.value} cursor="initial" />
          </div>
        )}
        {
          <div className="flex flex-col text-center">
            <div className="text-lg font-semibold">Deck</div>
            <SideDownUno label={"Draw"} onClick={drawCard} />
          </div>
        }
      </div>
    </div>
  );
}
