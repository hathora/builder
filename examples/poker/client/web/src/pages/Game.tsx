import { useHathoraContext } from "../context/GameContext";
import { Link, useParams } from "react-router-dom";
import useAutoJoinGame from "../hooks/useAutoJoinGame";
import Lobby from "../components/Lobby";
import ActiveGame from "../components/ActiveGame";
import { RoundStatus } from "../../../../api/types";
import Loader from "../components/PageLoader";
import Logo from "../assets/hathora-hammer-logo-light.png";

export default function Game() {
  const { gameId } = useParams();
  const { playerState } = useHathoraContext();

  useAutoJoinGame(gameId);

  const RenderGame = () => {
    if (playerState?.roundStatus === RoundStatus.WAITING) {
      return <Lobby status={playerState?.roundStatus} />;
    } else if (playerState?.roundStatus === RoundStatus.ACTIVE || playerState?.roundStatus === RoundStatus.COMPLETED) {
      return <ActiveGame />;
    }

    return <Loader />;
  };

  return (
    <div className="h-full">
      <div className="flex flex-row bg-slate-200 p-2 md:p-5">
        <div className="flex flex-row justify-center items-center">
          <Link to={"/"}>
            <img src={Logo} style={{ height: 50 }} />
          </Link>
          <div>
            Powered By{" "}
            <strong>
              <a href="https://github.com/hathora/hathora">Hathora</a>
            </strong>
          </div>
        </div>
      </div>
      {RenderGame()}
    </div>
  );
}
