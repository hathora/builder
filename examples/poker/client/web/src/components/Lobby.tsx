import { useHathoraContext } from "../context/GameContext";
import CopyToClipboard from "react-copy-to-clipboard";
import QRCode from "react-qr-code";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function Lobby() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { playerState, getUserName, startGame, endGame } = useHathoraContext();

  const playerCount = playerState?.players?.length ?? 0;

  return (
    <div className="flex items-center justify-center flex-col h-full bg-slate-100 py-5 h-full">
      <div className="p-5 lg:px-8 rounded shadow-black drop-shadow bg-white">
        <h2 className="text-xl tracking-tight font-bold text-gray-900 mb-2 text-center">Invite Friends</h2>
        <CopyToClipboard text={window.location.href} onCopy={() => toast.success("Copied room link to clipboard!")}>
          <div className="cursor-pointer w-full flex flex-col items-center">
            <QRCode className="m-0" value={window.location.href} />
            <div className="pl-5 mt-3 mb-3 text-md font-semibold flex items-center cursor-pointer">
              Room Code: {gameId} <ClipboardCopyIcon height={20} className={"h-fit mx-2"} />
            </div>
          </div>
        </CopyToClipboard>
        <div className="text-xl font-bold">Players in Lobby</div>
        {playerState?.players?.map((player) => (
          <div key={player.id} className="py-2 px-3 bg-slate-200 mx-1 border rounded border-solid shadow-gray-600 my-3">
            <div className="font-semibold">Name: {getUserName(player.id)}</div>
            <div className="flex">
              <span className="font-semibold mr-1">Chip Count:</span>${player.chipCount}
            </div>
          </div>
        ))}
        <div className="flex-col">
          <button
            onClick={startGame}
            disabled={playerCount < 2}
            className="mt-3 w-full block bg-blue-800 border border-blue-800 rounded p-2 text-xl font-semibold text-white text-center hover:bg-blue-900 h-fit"
          >
            Start Game
          </button>
          <button
            onClick={() => {
              endGame();
              navigate("/");
            }}
            disabled={playerCount < 2}
            className="mt-3 w-full block bg-red-600 border border-red-600 rounded p-2 text-xl font-semibold text-white text-center hover:bg-blue-800 h-fit"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
