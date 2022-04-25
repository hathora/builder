import SideDownUno from "../SideDownUno/SideDownUno";

export default function OpponentHand({
  cardCount,
  name,
  active,
  disabled,
}: {
  cardCount: number;
  name: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="text-lg font-semibold text-center">
        {active && <span className="text-2xl">➡️</span>} {name}
      </div>
      <div className="flex flex-row px-2 w-full overflow-x-auto hide-scroll-bar pb-8">
        <div className="inline-flex">
          {new Array(cardCount).fill(null, 0, cardCount)?.map((_, i) => (
            <SideDownUno key={i} disabled={disabled} />
          ))}
        </div>
      </div>
    </div>
  );
}
