import CardPile from "../CardPile/CardPile";
import GameHand from "../GameHand/GameHand";
import { useHathoraContext } from "../../context/GameContext";
import OpponentHand from "../OpponentHand/OpenentHand";

export default function ActiveGame() {
  const { playerState, user, getUserName } = useHathoraContext();

  return (
    <>
      <CardPile />
      {playerState?.players
        .filter((player) => player.numCards)
        .map((player) =>
          player.id === user?.id ? (
            <GameHand />
          ) : (
            <OpponentHand
              key={player.id}
              active={playerState?.turn === player?.id}
              name={getUserName(player.id)}
              cardCount={player?.numCards}
              disabled={playerState?.turn !== player?.id}
            />
          )
        )}
    </>
  );
}
