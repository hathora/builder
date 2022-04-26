import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import PlayerOfGame from "../components/player";
import { HathoraClient, HathoraConnection, UpdateArgs } from "../../../.hathora/client";
import { getUserDisplayName, UserData } from "../../../../api/base";

// Create new client
const client = new HathoraClient();

// Game Page
const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | undefined>(sessionStorage.getItem(client.appId) ?? undefined);

  useEffect(() => {
    if (location.hash.length > 0) {
      sessionStorage.setItem(client.appId, location.hash.substring(1));
      setToken(location.hash.substring(1));
      navigate(location.pathname, { replace: true });
    }
  }, [location]);
  console.log({ token });
  const user = token !== undefined ? HathoraClient.getUserFromToken(token) : undefined;
  console.log({ user });

  return (
    <div>
      {token === undefined || user === undefined ? (
        <div className="flex justify-center">Pls, Login in</div>
      ) : (
        <div className="grid p-5 grid-cols-1 bg-white h-screen dark:bg-black lg:grid-cols-4 grid-2">
          <div className="col-span-3 flex gap-2">
            <div className="flex flex-col justify-between">
              <PlayerOfGame user={user}/>
              {/* <PlayerOfGame /> */}
            </div>
            <Chessboard id={0} boardWidth={560} />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-5xl  font-bold lg:text-6xl dark:text-white text-indingo uppercase">
                <div>
                  Ch<span className="text-wine">ess</span>
                </div>
                <div>
                  <span className="text-wine">Hath</span>ora
                </div>
              </div>
            </div>
            <button className="bg-wine text-white px-12 rounded py-3 font-bold">Quit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
