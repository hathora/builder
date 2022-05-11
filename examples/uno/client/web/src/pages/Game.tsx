import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useHathoraContext } from "../context/GameContext";
import WinModal from "../components/WinModal";
import Lobby from "../components/Lobby";
import ActiveGame from "../components/ActiveGame";
import Logo from "../assets/hathora-hammer-logo-light.png";

export default function Game() {
  const { gameId } = useParams();
  const { disconnect, joinGame, playerState, token, user, login, endGame, getUserName, connecting } =
    useHathoraContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // auto join the game once on this page
    if (gameId && token && !playerState?.players?.find((p) => p.id === user?.id)) {
      joinGame(gameId).catch(console.error);
    }

    if (!token) {
      // log the user in if they aren't already logged in
      login();
    }
    return disconnect;
  }, [gameId, token]);

  const isGameActive = playerState?.turn !== undefined;

  useEffect(() => {
    if (playerState?.winner && isGameActive) {
      setIsOpen(true);
    }
  }, [playerState?.winner, isGameActive]);

  const handleGameEndModalClose = () => {
    setIsOpen(false);
    endGame();
    navigate("/");
  };

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden ">
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
        {!connecting && token ? (
          <div className="pt-5 flex-1 flex-col bg-gray-100 overflow-x-hidden overflow-y-scroll pb-44">
            {isGameActive ? <ActiveGame /> : <Lobby />}
          </div>
        ) : (
          <div className="flex h-full justify-center items-center">
            <div
              className="border-t-orange-400 animate-spin inline-block w-32 h-32 border-8 rounded-full"
              role="status"
            ></div>
          </div>
        )}
      </div>
      <WinModal
        isOpen={isOpen}
        onClose={handleGameEndModalClose}
        title={`${playerState?.winner && getUserName(playerState?.winner)} Won!!`}
      />
    </>
  );
}
