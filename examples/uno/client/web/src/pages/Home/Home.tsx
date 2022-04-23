import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHathoraContext } from "../../context/GameContext";

export default function Home() {
  const navigate = useNavigate();
  const { createGame } = useHathoraContext();
  const [gameId, setGameId] = useState<string>();

  return (
    <div className="h-full bg-slate-200 flex justify-center items-center">
      <div className="flex flex-col rounded bg-slate-300 h-3/5 w-5/6 sm:w-3/4 md:w-1/2 lg:w-2/6shadow shadow-gray-400">
        <div className="flex justify-center items-center h-4/6 w-full text-2xl lg:text-4xl md:text-2xl font-semibold">
          Welcome to UNO by Hathora
        </div>
        <div className="flex flex-col rounded bg-slate-300 justify-center items-center h-2/6 w-full">
          <div className="flex md:flex-row flex-col w-full lg:w-3/4 w-3/4 mb-10">
            <input
              onChange={(e) => setGameId(e.target.value)}
              placeholder="game id here..."
              className="w-full flex-1 px-5 py-3 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 focus:border-r-0 border-gray-300 rounded-l md:rounder-r-0"
            />
            <button
              onClick={() => {
                navigate(`/game/${gameId}`);
              }}
              className="block bg-orange-400 border border-orange-400 rounded-r p-2 text-xl font-semibold text-white text-center hover:bg-orange-500 h-fit"
            >
              Join Existing Game
            </button>
          </div>
          <div className="w-3/4 lg:w-3/4 flex justify-center items-center mb-10">
            <button
              onClick={() => {
                createGame().then((stateId) => {
                  navigate(`/game/${stateId}`);
                });
              }}
              className="w-full block bg-green-500 border border-green-500 rounded-md p-2 text-xl font-semibold text-white text-center hover:bg-green-500 h-fit"
            >
              Create Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
