import React, { useRef, useLayoutEffect, useContext, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ChevronRightIcon, ChevronDownIcon, MinusSmIcon, PlusSmIcon, UserCircleIcon } from "@heroicons/react/solid";
import { getUserDisplayName, lookupUser, UserData } from "../../../api/base";
import * as T from "../../../api/types";
import { HathoraConnection } from "../../.hathora/client";
import BoardPlugin from "./plugins/Board/index";
import { HathoraContext } from "./context";
import PawnIcon from "./assets/pawn.svg";

window.customElements.define("board-plugin", BoardPlugin);

function KVDisplay(props: { label: string; typeString: string; children: JSX.Element }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  let icon;
  if (isCollapsed) {
    icon = <ChevronRightIcon className="w-3 h-3 fill-current" aria-hidden="true" />;
  } else {
    icon = <ChevronDownIcon className="w-3 h-3 fill-current" aria-hidden="true" />;
  }
  return (
    <div className="p-1 m-1 kv-display bg-white dark:bg-black">
      <span className="mr-1 align-middle">
        <button type="button" onClick={() => setIsCollapsed(!isCollapsed)}>
          {icon}
        </button>
      </span>
      <span className="group">
        <span className="hidden text-sm italic text-gray-500 group-hover:inline">({props.typeString}) </span>
        <span className="font-bold">{props.label}: </span>
      </span>
      {isCollapsed ? "..." : props.children}
    </div>
  );
}

function ArrayDisplay<T>(props: { value: T[]; children: (value: T) => JSX.Element }) {
  return (
    <span className={`array-display`}>
      [
      {props.value.length > 0 && (
        <>
          <span className="ml-2 text-sm italic text-gray-500">
            {props.value.length} {props.value.length === 1 ? "item" : "items"}
          </span>
          <div
            className={`flex h-40   ${
              typeof props.value[0] === "object"
                ? "flex-row overflow-x-auto"
                : "flex-row md:flex-col array-max-height overflow-y-auto"
            }`}
          >
            {props.value.map((val, i) => (
              <div key={i}>{props.children(val)}</div>
            ))}
          </div>
        </>
      )}
      ]
    </span>
  );
}
function ArrayPlayerDisplay<T>(props: { value: T[]; children: (value: T) => JSX.Element }) {
  return (
    <span>
      {props.value.length > 0 && (
        <>
          <div
            className={`flex ${
              typeof props.value[0] === "object"
                ? "flex-row md:flex-col justify-between items-center overflow-x-auto"
                : "md:flex-col flex-row array-max-height overflow-y-auto"
            }`}
          >
            {props.value.map((val, i) => (
              <div key={i}>{props.children(val)}</div>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

function EnumDisplay(props: { value: number; enum: object }) {
  const labels = Object.entries(props.enum)
    .filter(([_, value]) => typeof value === "number")
    .map(([label, _]) => label);
  if (labels[props.value] === "WAITING") {
    return <div className="">Pls Join to start game.</div>;
  } else if (labels[props.value] === "WHITE_TURN") {
    return <div>WHITE TURN</div>;
  } else if (labels[props.value] === "BLACK_TURN") {
    return <div>BLACK TURN</div>;
  } else if (labels[props.value] === "WHITE_WON") {
    return <div>WHITE WINS</div>;
  } else {
    return <div>BLACK WINS</div>;
  }
}

function UserIdDisplay({ player }: { player: string }) {
  const [userData, setUserData] = useState<UserData>();
  const { user } = useContext(HathoraContext)!;
  useEffect(() => {
    lookupUser(player).then(setUserData);
  }, [player]);
  const renderDisplayText = (displayName: string) => (
    <span className="flex items-center user-display">{displayName}</span>
  );
  if (userData === undefined) {
    return <div className="max-w-md p-1 m-1 text-center">{renderDisplayText(player)}</div>;
  }
  return (
    <div className="max-w-md p-1 m-1">
      <div className="flex items-center text-center font-semibold dark:text-white">
        {/* if it's the player, returns You-name */}
        {userData.id === user.id ? (
          <div>You:{renderDisplayText(getUserDisplayName(userData))}</div>
        ) : (
          <div>{renderDisplayText(getUserDisplayName(userData))}</div>
        )}
      </div>
    </div>
  );
}

function StringDisplay({ value }: { value: string }) {
  return <span className="string-display">"{value}"</span>;
}
function PluginDisplay<T>(props: { value: T; component: string; children: (value: T) => JSX.Element }) {
  const { connection, user, state, updatedAt, pluginsAsObjects } = useContext(HathoraContext)!;
  useEffect(() => {
    console.log({ HathoraContext });
  }, []);

  const ref = useRef<{ val: T; client: HathoraConnection; user: UserData; state: T.PlayerState; updatedAt: number }>();
  const displayError = (e: CustomEvent) => toast.error(e.detail);
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.val = props.value;
      ref.current.client = connection;
      ref.current.user = user;
      ref.current.state = state;
      ref.current.updatedAt = updatedAt;
      (ref.current as any).addEventListener("error", displayError);
      return () => {
        if (ref.current) {
          (ref.current as any).removeEventListener("error", displayError);
        }
      };
    }
  });
  if (pluginsAsObjects) {
    return props.children(props.value);
  } else {
    return <div className="p-1 plugin-display">{React.createElement(props.component, { ref })}</div>;
  }
}

function PieceDisplay({ value }: { value: T.Piece }) {
  return (
    <div className="border rounded object-display">
      <KVDisplay label="color" typeString="Color">
        <EnumDisplay value={value.color} enum={T.Color} />
      </KVDisplay>
      <KVDisplay label="type" typeString="PieceType">
        <EnumDisplay value={value.type} enum={T.PieceType} />
      </KVDisplay>
      <StringDisplay value={value.square} />
    </div>
  );
}

function PlayerDisplay({ value }: { value: T.Player }) {
  return <UserIdDisplay player={value.id} />;
}

function PlayerStateDisplay({ value }: { value: T.PlayerState }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 px-auto">
        <div className="order-last md:order-first">
          <ArrayPlayerDisplay<T.Player> value={value.players}>
            {(value) => (
              <div className="flex flex-col justify-center items-center">
                <div className="shadow bg-white dark:bg-black shadow-md p-2 relative">
                  <img src={PawnIcon} alt="Knight Icon" />
                </div>
                <PlayerDisplay value={value} />
              </div>
            )}
          </ArrayPlayerDisplay>
        </div>
        <div className="col-span-3 px-auto">
          <PluginDisplay value={value.board} component="board-plugin">
            {(value) => <ArrayDisplay<T.Piece> value={value}>{(value) => <PieceDisplay value={value} />}</ArrayDisplay>}
          </PluginDisplay>
        </div>
      </div>
      <div className="text-center text-xl my-3 md:my-1 font-bold uppercase">
        <EnumDisplay value={value.status} enum={T.GameStatus} />
      </div>
    </div>
  );
}

export function State() {
  const { state: value } = useContext(HathoraContext)!;

  return (
    <div className="w-full font-mono text-gray-700 dark:text-white  state-display">
      <PlayerStateDisplay value={value} />
    </div>
  );
}
