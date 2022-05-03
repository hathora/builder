import { useHathoraContext } from "../context/GameContext";
import { useParams } from "react-router-dom";
import useAutoJoinGame from "../hooks/useAutoJoinGame";
import Lobby from "../components/Lobby";
import ActiveGame from "../components/ActiveGame";
import { RoundStatus } from "../../../../api/types";
import Loader from "../components/PageLoader";

export default function Game() {
  const { gameId } = useParams();
  const { playerState } = useHathoraContext();

  useAutoJoinGame(gameId);

  if (playerState?.roundStatus === RoundStatus.WAITING || playerState?.roundStatus === RoundStatus.COMPLETED) {
    return <Lobby status={playerState?.roundStatus} />;
  } else if (playerState?.roundStatus === RoundStatus.ACTIVE) {
    return <ActiveGame />;
  }

  return <Loader />;
}
