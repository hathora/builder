import { useParams } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
import { useHathoraContext } from "../context/GameContext";
import PlayerList from "./PlayerList";

export default function Lobby() {
  const { gameId } = useParams();
  const { startGame } = useHathoraContext();
  return (
    <>
      <div className="flex flex-col h-full justify-center items-center mb-2">
        <h2 className="text-xl tracking-tight font-bold text-gray-900 mb-2">Invite Friends</h2>
        <CopyToClipboard text={window.location.href} onCopy={() => toast.success("Copied room link to clipboard!")}>
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
  );
}
