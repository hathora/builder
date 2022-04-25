import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { useHathoraContext } from "../../context/GameContext";
import WinModal from "../../components/WinModal";
import ActiveGame from "../../components/ActiveGame/ActiveGame";
import PlayerList from "../../components/PlayerList/PlayerList";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
import Logo from "../../assets/hathora-hammer-logo-light.png";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";

export default function Game() {
  const { gameId } = useParams();
  const { disconnect, joinGame, playerState, token, user, login, startGame, endGame, getUserName } =
    useHathoraContext();
  const navigate = useNavigate();
  let [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // auto join the game once on this page
    if (gameId && token && !playerState?.players?.find((p) => p.id === user?.id)) {
      joinGame(gameId).catch((e) => console.log(e));
    }

    if (!token) {
      // log the user in if they aren't already logged in
      login();
    }
    return disconnect;
  }, [gameId, token]);

  const isGameActive = Boolean(playerState?.turn);

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
            <img src={Logo} style={{ height: 50 }} />
            <div>
              Powered By{" "}
              <strong>
                <a href="https://github.com/hathora/hathora">Hathora</a>
              </strong>
            </div>
          </div>
        </div>
        <div className="pt-5 flex-1 flex-col bg-gray-100 overflow-x-hidden overflow-y-scroll pb-44">
          {isGameActive ? (
            <ActiveGame />
          ) : (
            <>
              <div className="flex flex-col h-full justify-center items-center mb-2">
                <h2 className="text-xl tracking-tight font-bold text-gray-900 mb-2">Invite Friends</h2>
                <CopyToClipboard
                  text={window.location.href}
                  onCopy={() => toast.success("Copied Room code to clipboard!")}
                >
                  <div className="cursor-pointer">
                    <QRCode value={window.location.href} />

                    <div className="pl-5 mt-3 mb-3 text-md font-semibold flex items-center cursor-pointer">
                      Room Code: {gameId} <ClipboardCopyIcon height={20} className={"h-fit mx-2"} />
                    </div>
                  </div>
                </CopyToClipboard>
                <h2 className="text-xl tracking-tight font-bold text-gray-900 mt-3">Players in lobby</h2>
                <PlayerList />
                <button
                  onClick={startGame}
                  className="mt-3 block bg-orange-400 border border-orange-400 rounded p-2 text-xl font-semibold text-white text-center hover:bg-orange-500 h-fit"
                >
                  Let's Start the Game
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <WinModal
        isOpen={isOpen}
        onClose={handleGameEndModalClose}
        title={`${playerState?.winner && getUserName(playerState?.winner)} Won!!`}
      />
    </>
  );
}
