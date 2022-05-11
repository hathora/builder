import CopyToClipboard from "react-copy-to-clipboard";
import QRCode from "react-qr-code";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import classNames from "classnames";

import { useHathoraContext } from "../context/GameContext";
import { RoundStatus } from "../../../../api/types";
import { useState } from "react";

interface LobbyProps {
  status: RoundStatus;
}

export default function Lobby({ status }: LobbyProps) {
  const { gameId } = useParams();
  const [buyIn, setBuyIn] = useState(10);
  const [totalChips, setTotalChips] = useState(1000);

  const { playerState, getUserName, startGame, user } = useHathoraContext();

  const playerCount = playerState?.players?.length ?? 0;
  const disableStartGame = playerCount < 2;
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
            <div className="font-semibold">
              {player.id === user?.id ? "⭐ " : ""}
              {getUserName(player.id)}
            </div>
          </div>
        ))}
        <div className="flex w-full flex-col  mx-1">
          <p className="text-xs text-gray-700 mb-1">Total Chips</p>
          <input
            value={totalChips}
            onChange={(e) => setTotalChips(parseInt(e.target.value))}
            type="number"
            placeholder="Starting Chips"
            className="px-2 shadow py-2 border placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 focus:border-r-0 border-gray-300 rounded mb-3"
          />
          <p className="text-xs text-gray-700 mb-1">Buy In</p>
          <input
            value={buyIn}
            onChange={(e) => setBuyIn(parseInt(e.target.value))}
            type="number"
            placeholder="Buy In"
            className="px-2 shadow py-2 border placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 focus:border-r-0 border-gray-300 rounded mb-3"
          />
        </div>
        <div className="flex-col">
          {disableStartGame && (
            <p className="text-xs text-gray-700">At least two players are required before starting the game</p>
          )}
          <button
            onClick={() => startGame(totalChips, buyIn)}
            disabled={disableStartGame}
            className={classNames(
              `mt-3 w-full block bg-blue-800 border border-blue-800 rounded p-2 text-xl font-semibold text-white text-center hover:bg-blue-900 h-fit`,
              {
                "opacity-50": disableStartGame,
              }
            )}
          >
            {status === RoundStatus.WAITING ? "Start Game" : "Start Round"}
          </button>
        </div>
      </div>
    </div>
  );
}
