import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHathoraContext } from "../context/GameContext";
import Logo from "../assets/hathora-hammer-logo-light.png";

export default function Home() {
  const navigate = useNavigate();
  const { createGame } = useHathoraContext();
  const [gameId, setGameId] = useState<string>();

  return (
    <div className="h-full bg-slate-100 flex justify-center items-center">
      <div className="flex flex-col rounded bg-white py-5 w-5/6 sm:w-2/3 lg:w-1/2 xl:w-2/5 shadow drop-shadow">
        <div className="flex flex-col justify-center items-center h-4/6 w-full text-2xl lg:text-4xl md:text-2xl font-semibold">
          <img src={Logo} style={{ width: 150 }} />
          <div>
            <strong>Poker</strong>
          </div>
          <div>
            by <strong>Hathora</strong>
          </div>
        </div>
        <div className="flex flex-col rounded bg-white justify-center items-center h-2/6 w-full">
          <div className="flex md:flex-row flex-col w-full lg:w-3/4 w-3/4 md:mb-10 my-3">
            <input
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Room code here..."
              className="w-full flex-1 px-5 shadow py-3 border placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 focus:border-r-0 border-gray-300 rounded-l md:rounder-r-0 md:mb-0 mb-5"
            />
            <button
              onClick={() => {
                navigate(`/game/${gameId}`);
              }}
              className="block bg-blue-800 border border-blue-800 rounded-r p-2 text-xl font-semibold text-white text-center hover:bg-blue-900 shadow"
            >
              Join Existing Game
            </button>
          </div>
          <div className="w-3/4 lg:w-3/4 flex justify-center items-center">
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
