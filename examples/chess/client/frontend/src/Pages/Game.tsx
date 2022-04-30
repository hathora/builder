import { useEffect, useState } from "react";
import {  useParams, Link, } from "react-router-dom";
import { toast } from "react-toastify";
import { UserData } from "../../../../api/base";
import { HathoraConnection, UpdateArgs } from "../../../.hathora/client";
import { ConnectionFailure } from "../../../.hathora/failures";
import DarkModeToggler from "../components/darkModeToggle";
import { HathoraContext } from "./../context";
import { JoinGameButton } from "./../Forms";
import { State } from "./../State";
import LoadersIcon from '../assets/loaders.svg'
type MainProps = {
  user: UserData;
  connection: HathoraConnection | undefined;
  updateArgs: UpdateArgs | undefined;
  connectionError: ConnectionFailure | undefined;
  onConnect: (stateId: string) => void;
  onDisconnect: () => void;
};

function Game({ user, connection, connectionError, updateArgs, onConnect, onDisconnect }: MainProps) {
  const { stateId } = useParams();
  const [pluginsAsObjects, setPluginsAsObjects] = useState(false);
  useEffect(() => {
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
        <img src={LoadersIcon} alt="Loader Icon"  />
      </div>
    );
  }

  updateArgs.events.forEach((event) => toast.info(event));

  return (
    <HathoraContext.Provider value={{ user, connection, ...updateArgs, pluginsAsObjects }}>
      <div className="bg-white dark:bg-black h-screen relative">
        <div className="fixed bottom-2 md:top-2 right-2">
          <DarkModeToggler />
        </div>
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
            <div className="flex gap-2 items-center">
              <JoinGameButton />
              <div>
                {/* <CopyToClipboard
                  text={window.location.href}
                  onCopy={() => toast.success("Game code successfully copied!")}
                > */}

                    <div className="  text-sm dark:text-white font-semibold flex items-center cursor-pointer">
                      {/* Copy Game Code: {stateId} <ClipboardCopyIcon height={20} className={"h-fit mx-2"} /> */}
                  </div>
                {/* </CopyToClipboard> */}
                <Link to={location.pathname}>Copy link</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HathoraContext.Provider>
  );
}

export default Game;
