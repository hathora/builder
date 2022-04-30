import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { Response } from "../../../api/base";
import { IInitializeRequest, IJoinGameRequest } from "../../../api/types";
import * as T from "../../../api/types";
import { HathoraContext } from "./context";
import KnightIcon from "./assets/Knight.svg";

type MethodProps<T> = {
  submit: (value: T) => Promise<Response>;
  initialize: () => T;
  children: (value: T, update: (value: T) => void) => JSX.Element;
};


export function MethodForm<T>({ submit, initialize, children }: MethodProps<T>) {
  const [value, setValue] = useState<T>(initialize());
  return (
    <div className="p-3 mb-3 ">
      {children(value, setValue)}
      <div className="flex mt-3">
        <button
          type="button"
          onClick={async () => {
            const res = await submit(value);
            if (res.type === "error") {
              toast.error(res.error);
            }
            setValue(initialize());
          }}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-wine border border-transparent rounded shadow-sm hover:bg-indingo  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

export function InitializeForm({ submit }: { submit: (value: IInitializeRequest) => void }) {
  const [value, update] = useState<IInitializeRequest>(IInitializeRequest.default());
  return (
    <>
      <button
        type="button"
        onClick={() => submit(value)}
        className="inline-flex items-center px-4 rounded py-2 bg-wine text-white font-bold"
      >
        <img src={KnightIcon} alt="Knight Ion" className="px-1" />
        New Game
      </button>
    </>
  );
}
export function JoinGameButton() {
  const { connection } = useContext(HathoraContext)!;
  return (
    <MethodForm<IJoinGameRequest> submit={connection.joinGame.bind(connection)} initialize={IJoinGameRequest.default}>
      {(value, update) => <div className="grid grid-cols-6 gap-2 pl-2 ml-2 border-l border-gray-300"></div>}
    </MethodForm>
  );
}
