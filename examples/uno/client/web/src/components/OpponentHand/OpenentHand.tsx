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
    <div className="flex flex-col justify-center items-center pb-5">
      <div className="text-lg font-semibold text-center">
        {active && <span className="text-2xl">➡️</span>} {name}
      </div>
      <div className="hand-row flex max-w-full flex-wrap h-full pb-10">
        {new Array(cardCount).fill(null, 0, cardCount)?.map((_, i) => (
          <SideDownUno key={i} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}
