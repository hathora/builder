import React, { useRef, useLayoutEffect, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ChevronRightIcon, ChevronDownIcon, MinusSmIcon, PlusSmIcon, UserCircleIcon } from "@heroicons/react/solid";
import { getUserDisplayName, lookupUser, UserData } from "../../../api/base";
import * as T from "../../../api/types";
import { HathoraConnection } from "../../.hathora/client";
import BoardPlugin from "./plugins/Board/index";
import { HathoraContext } from "./context";
import PawnIcon from "./assets/pawn.svg";

window.customElements.define("board-plugin", BoardPlugin);
console.log({ BoardPlugin });

function KVDisplay(props: { label: string; typeString: string; children: JSX.Element }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  let icon;
  if (isCollapsed) {
    icon = <ChevronRightIcon className="w-3 h-3 fill-current" aria-hidden="true" />;
  } else {
    icon = <ChevronDownIcon className="w-3 h-3 fill-current" aria-hidden="true" />;
  }
  return (
    <div className="p-1 m-1 kv-display">
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
            className={`flex ${
              typeof props.value[0] === "object"
                ? "flex-row overflow-x-auto"
                : "flex-col array-max-height overflow-y-auto"
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
                ? "flex-col justify-between items-center overflow-x-auto"
                : "flex-col array-max-height overflow-y-auto"
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

function OptionalDisplay<T>(props: { value: T | undefined; children: (value: T) => JSX.Element }) {
  if (props.value === undefined) {
    return <span className="text-sm italic text-gray-500">none</span>;
  }
  return <span className="optional-display">{props.children(props.value)}</span>;
}


function EnumDisplay(props: { value: number; enum: object }) {
  const labels = Object.entries(props.enum)
    .filter(([_, value]) => typeof value === "number")
    .map(([label, _]) => label);
  return <span className="enum-display">{labels[props.value]}</span>;
}

function UserIdDisplay({ value }: { value: string }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData>();
  useEffect(() => {
    lookupUser(value).then(setUserData);
  }, [value]);
  const renderDisplayText = (displayName: string) => (
    <span className="flex items-center user-display">
      <UserCircleIcon className="inline flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" aria-hidden="true" />
      {displayName}
    </span>
  );
  let icon;
  if (isCollapsed) {
    icon = <PlusSmIcon className="w-3 h-3 fill-current" aria-hidden="true" />;
  } else {
    icon = <MinusSmIcon className="w-3 h-3 fill-current" aria-hidden="true" />;
  }
  if (userData === undefined) {
    return <div className="max-w-md p-1 m-1 border rounded">{renderDisplayText(value)}</div>;
  }
  return (
    <div className="max-w-md p-1 m-1 border rounded">
      <div className="flex items-center justify-between">
        {renderDisplayText(getUserDisplayName(userData))}
        <span className="align-middle mr-0.5 ml-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center text-sm font-medium text-gray-700 bg-gray-100 border border-gray-700 rounded-md shadow-sm hover:bg-gray-200 hover:text-gray-900 hover:border-gray-900 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50"
          >
            {icon}
          </button>
        </span>
      </div>
      {!isCollapsed && (
        <div className="mt-1">
          <div className="kv-display">
            <span className="font-bold">UserId: </span>
            <StringDisplay value={userData.id} />
          </div>
          <div className="kv-display">
            <span className="font-bold">type: </span>
            <StringDisplay value={userData.type} />
          </div>
        </div>
      )}
    </div>
  );
}

function StringDisplay({ value }: { value: string }) {
  return <span className="string-display">"{value}"</span>;
}

function IntDisplay({ value }: { value: number }) {
  return <span className="int-display">{value}</span>;
}

function FloatDisplay({ value }: { value: number }) {
  return <span className="float-display">{value}</span>;
}

function BooleanDisplay({ value }: { value: boolean }) {
  return <span className="boolean-display">{value ? "true" : "false"}</span>;
}

function PluginDisplay<T>(props: { value: T; component: string; children: (value: T) => JSX.Element }) {
  const { connection, user, state, updatedAt, pluginsAsObjects } = useContext(HathoraContext)!;
  useEffect(() => {
    console.log({ state });
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
      <KVDisplay label="square" typeString="Square">
        <StringDisplay value={value.square} />
      </KVDisplay>
    </div>
  );
}

function PlayerDisplay({ value }: { value: T.Player }) {
  return <div className=" text-indingo dark:text-white object-display">{value.id}</div>;
}

function PlayerStateDisplay({ value }: { value: T.PlayerState }) {
  return (
    <div className="h-screen">
      <div className="grid grid-cols-1 grid-cols-4 ">
        <div>
          <ArrayPlayerDisplay<T.Player> value={value.players}>
            {(value) => (
              <div>
                <div className="shadow bg-white dark:bg-black shadow-md p-2 relative">
                  <div className="absolute h-3 w-3 bg-gray right-5 top-2"></div>
                  <img src={PawnIcon} alt="Knight Icon" />
                </div>
                <PlayerDisplay value={value} />
              </div>
            )}
          </ArrayPlayerDisplay>
        </div>
        <div className="col-span-3">
          <PluginDisplay value={value.board} component="board-plugin">
            {(value) => <ArrayDisplay<T.Piece> value={value}>{(value) => <PieceDisplay value={value} />}</ArrayDisplay>}
          </PluginDisplay>
        </div>
      </div>
      <KVDisplay label="status" typeString="GameStatus">
        <EnumDisplay value={ value.status } enum={ T.GameStatus } />
      </KVDisplay>
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
