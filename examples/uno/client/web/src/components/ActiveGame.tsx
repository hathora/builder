import { useHathoraContext } from "../context/GameContext";
import CardPile from "./CardPile";
import GameHand from "./GameHand";
import OpponentHand from "./OpenentHand";

export default function ActiveGame() {
  const { playerState, user, getUserName } = useHathoraContext();
  const currentUserIndex = playerState?.players.findIndex((p) => p.id === user?.id);

  const players = [
    ...(playerState?.players.slice(currentUserIndex || 0, playerState.players.length) || []),
    ...(playerState?.players.slice(0, currentUserIndex) || []),
  ];

  return (
    <>
      <CardPile />
      {players.map((player) =>
        player.id === user?.id ? (
          <GameHand key={user.id} />
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
