// import { useState } from "react";
// import logo from "./logo.svg";
// import "./App.css";
// import Home from "./Pages/Home";
// import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
// import Game from "./Pages/Game";

// const App = () => {
//   return (
//     <Router>
//       {/* <Nav /> */}
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/game" element={<Game />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;

import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, Zoom, toast } from "react-toastify";
import { EyeIcon, LightningBoltIcon, UserCircleIcon } from "@heroicons/react/solid";
import { getUserDisplayName, UserData } from "../../../api/base";
import { IInitializeRequest } from "../../../api/types";
import { HathoraClient, HathoraConnection, UpdateArgs } from "../../.hathora/client";
import { ConnectionFailure } from "../../.hathora/failures";
import { HathoraContext } from "./context";
import { InitializeForm, JoinGameButton } from "./Forms";
import { State } from "./State";
import NavBar from "./components/navbar";

import Input from "./components/inputField";
import KnightIcon from "./assets/Knight.svg";

import "react-toastify/dist/ReactToastify.css";

const client = new HathoraClient();

export default function App() {
  const [token, setToken] = useState<string | undefined>(sessionStorage.getItem(client.appId) ?? undefined);
  const [connection, setConnection] = useState<HathoraConnection>();
  const [updateArgs, setUpdateArgs] = useState<UpdateArgs>();
  const [connectionError, setConnectionError] = useState<ConnectionFailure>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash.length > 0) {
      sessionStorage.setItem(client.appId, location.hash.substring(1));
      setToken(location.hash.substring(1));
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const user = token !== undefined ? HathoraClient.getUserFromToken(token) : undefined;

  return (
    <>
      {/* <NavBar /> */}

      <div id="app">
        {token === undefined || user === undefined ? (
          <Login setToken={setToken} />
        ) : (
          <Routes>
            <Route
              path="/state/:stateId"
              element={
                <Main
                  user={user}
                  connection={connection}
                  updateArgs={updateArgs}
                  connectionError={connectionError}
                  onConnect={(stateId) =>
                    setConnection(client.connect(token, stateId, setUpdateArgs, setConnectionError))
                  }
                  onDisconnect={() => {
                    if (connection !== undefined) {
                      connection.disconnect();
                      setConnection(undefined);
                      setUpdateArgs(undefined);
                      setConnectionError(undefined);
                    }
                  }}
                />
              }
            />
            <Route
              path="/"
              element={
                <Home onConnect={async (request) => navigate(`/state/${await client.create(token, request)}`)} />
              }
            />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        )}
      </div>
    </>
  );
}

function Login({ setToken }: { setToken: (token: string) => void }) {
  return (
    <div className="flex flex-col w-full h-screen bg-white dark:bg-black justify-center text-center items-center">
      <div className=" m-auto">
        <div className="flex flex-col mt-2">
          <div className=" mb-4">
            <button
              type="button"
              onClick={() =>
                client
                  .loginAnonymous()
                  .then((token) => {
                    sessionStorage.setItem(client.appId, token);
                    setToken(token);
                  })
                  .catch((e) => toast.error("Authentication error: " + e.reason))
              }
              className="inline-flex items-center px-4 py-2 text-sm  font-medium text-white bg-wine border border-transparent rounded shadow-sm hover:bg-indingo "
            >
              Login (Anonymous)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home({ onConnect }: { onConnect: (request: IInitializeRequest) => void }) {
  const [stateId, setStateId] = useState<string>("");
  const navigate = useNavigate();
  return (
    <div>
      <div>
        <div className="flex home dark:bg-black flex-col h-screen pt-28 items-center  transition duration-500">
          <h1 className="uppercase text-6xl lg:text-8xl xl:text-9xl  font-bold text-indingo dark:text-white">
            <span className="">Ch</span>
            <span className="text-wine">ess</span>
          </h1>
          <h1 className="uppercase text-6xl lg:text-8xl xl:text-9xl text-indingo dark:text-white font-bold">
            <span className="text-wine">Hath</span>ora
          </h1>
          <p className="md:w-3/4 lg:w-1/2 font-semibold text-center dark:text-white text-sm text-indingo">
            Chess is an abstract strategy game and involves no hidden information. It is played on a square chessboard
            with 64 squares arranged in an eight-by-eight grid.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 mt-3">
            <InitializeForm submit={onConnect} />
            <Input />
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col w-full md:justify-center">
        <div className="w-6/12 m-auto">
          <h2 className="text-xl font-semibold text-gray-900">Home</h2>
          <div className="flex flex-col mt-2">
            <div className="w-6/12 mb-4">
              <InitializeForm submit={onConnect} />
            </div>
            <div className="w-6/12">
              <input
                type="text"
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="block w-full mb-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => navigate(`/state/${stateId}`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Join Existing
              </button>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

type MainProps = {
  user: UserData;
  connection: HathoraConnection | undefined;
  updateArgs: UpdateArgs | undefined;
  connectionError: ConnectionFailure | undefined;
  onConnect: (stateId: string) => void;
  onDisconnect: () => void;
};
function Main({ user, connection, connectionError, updateArgs, onConnect, onDisconnect }: MainProps) {
  const { stateId } = useParams();
  const [openMethods, setOpenMethods] = useState(false);
  const [pluginsAsObjects, setPluginsAsObjects] = useState(false);
  useEffect(() => {
    console.log({ openMethods });

    if (connection === undefined) {
      onConnect(stateId!);
    }
    return onDisconnect;
  }, [connection]);

  if (connectionError !== undefined) {
    return (
      <div className="flex justify-center items-center text-center h-screen text-black font-bold text-xl md:text-2xl dark:bg-black dark:text-white">
        Connection error: {connectionError.message}
      </div>
    );
  }

  if (connection === undefined || updateArgs === undefined) {
    return (
      <div className="flex justify-center items-center h-screen text-black font-bold text-2xl dark:bg-black dark:text-white">
        Loading...
      </div>
    );
  }

  updateArgs.events.forEach((event) => toast.info(event));

  return (
    <HathoraContext.Provider value={{ user, connection, ...updateArgs, pluginsAsObjects }}>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-black">
          <div className="col-span-2">
            <State />
          </div>
          <div className="flex flex-col ">
            <div>
              <div className="text-6xl font-bold text-indingo dark:text-white uppercase">
                CH<span className="text-wine">ESS</span>
              </div>
              <div className="text-6xl font-bold text-indingo dark:text-white uppercase">
                <span className="text-wine">Hath</span>ora
              </div>
            </div>
            <div>
              <JoinGameButton />
            </div>
          </div>
        </div>
      </div>
    </HathoraContext.Provider>
  );
}

