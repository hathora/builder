import CardPile from "../CardPile/CardPile";
import GameHand from "../GameHand/GameHand";
import { useHathoraContext } from "../../context/GameContext";
import OpponentHand from "../OpponentHand/OpenentHand";

export default function ActiveGame() {
  const { playerState, user, getUserName } = useHathoraContext();

  return (
    <>
      <CardPile />
      <GameHand />
      {playerState?.players
        ?.filter((p) => user?.id !== p.id)
        .map((user) => (
          <OpponentHand
            key={user.id}
            active={playerState?.turn === user?.id}
            name={getUserName(user.id)}
            cardCount={user?.numCards}
            disabled={playerState?.turn !== user?.id}
          />
        ))}
    </>
  );
}
