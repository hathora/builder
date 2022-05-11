import { useMemo } from "react";

export const CardComponent = ({ card = "", size = 100 }: { card: string; size?: number }) => {
  const src = useMemo(() => new URL(`../assets/${card}.svg`, import.meta.url).href, [card]);

  return <img width={size} className="mx-1" src={src} />;
};
