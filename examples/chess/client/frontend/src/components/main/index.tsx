import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import PlayerOfGame from "../../components/player";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, Zoom, toast } from "react-toastify";
import { EyeIcon, LightningBoltIcon, UserCircleIcon } from "@heroicons/react/solid";
import { getUserDisplayName, UserData } from "../../../../../api/base";
import { HathoraClient, HathoraConnection, UpdateArgs } from "../../../../.hathora/client";
import { ConnectionFailure } from "../../../../.hathora/failures";
import { HathoraContext } from "../context";

type MainProps = {
  user: UserData;
  connection: HathoraConnection | undefined;
  updateArgs: UpdateArgs | undefined;
  connectionError: ConnectionFailure | undefined;
  onConnect: (stateId: string) => void;
  onDisconnect: () => void;
};
const client = new HathoraClient();

function Main({ user, connection, connectionError, updateArgs, onConnect, onDisconnect }: MainProps) {
  const { stateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | undefined>(sessionStorage.getItem(client.appId) ?? undefined);
  const [openMethods, setOpenMethods] = useState(false);
  const [pluginsAsObjects, setPluginsAsObjects] = useState(false);
  useEffect(() => {
    if (location.hash.length > 0) {
      sessionStorage.setItem(client.appId, location.hash.substring(1));
      setToken(location.hash.substring(1));
      navigate(location.pathname, { replace: true });
    }
    console.log({ token });

    if (connection === undefined) {
      onConnect(stateId!);
    }
    return onDisconnect;
  }, [connection]);

  if (connectionError !== undefined) {
    return <div>Connection error: {connectionError.message}</div>;
  }

  if (connection === undefined || updateArgs === undefined) {
    return <div>Loading...</div>;
  }

  updateArgs.events.forEach((event) => toast.info(event));

  return (
    <HathoraContext.Provider value={{ user, connection, ...updateArgs, pluginsAsObjects }}>
      <div className="fixed top-24 right-6 lg:right-10">
        <span className="sm:ml-3">
          <button
            type="button"
            onClick={() => setOpenMethods(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LightningBoltIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
            Methods
          </button>
        </span>
      </div>
      <div className="absolute top-4 right-4 lg:right-10">
        <span className="sm:ml-3">
          <button
            type="button"
            onClick={() => setPluginsAsObjects(!pluginsAsObjects)}
            className="inline-flex items-center px-4 py-2 text-xs font-medium text-indigo-200"
          >
            <EyeIcon className="w-4 h-4 mr-0.5 -ml-0.5" aria-hidden="true" />
            Toggle Plugin View
          </button>
        </span>
      </div>
      {/* <State />
        <Forms open={openMethods} setOpen={setOpenMethods} /> */}
    </HathoraContext.Provider>
  );
}


export default Main;