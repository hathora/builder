import React, { Fragment, useState, useContext } from "react";
import { toast } from "react-toastify";
import { Dialog, Listbox, Switch, Transition } from "@headlessui/react";
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, PlusIcon, SelectorIcon, XIcon } from "@heroicons/react/outline";
import { LightningBoltIcon } from "@heroicons/react/solid";
import { Response } from "../../../api/base";
import { IInitializeRequest, IJoinGameRequest, IMovePieceRequest } from "../../../api/types";
import * as T from "../../../api/types";
import { HathoraContext } from "./context";
import KnightIcon from "./assets/Knight.svg";

type MethodProps<T> = {
  submit: (value: T) => Promise<Response>;
  initialize: () => T;
  children: (value: T, update: (value: T) => void) => JSX.Element;
};
type BaseProps<T> = { value: T; update: (value: T) => void };
type ContainerProps<T> = { initialVal: T; children: (value: T, update: (value: T) => void) => JSX.Element };
type ArrayProps<T> = BaseProps<T[]> & ContainerProps<T>;
type OptionalProps<T> = BaseProps<T | undefined> & ContainerProps<T>;
type EnumProps = BaseProps<number> & { enumType: object };

function classNames(...classes: string[]) {
  return classes.join(" ");
}

export function MethodForm<T>({  submit, initialize, children }: MethodProps<T>) {
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
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

function ArrayInput<T>({ value, update, initialVal, children }: ArrayProps<T>) {
  function swapArgs(i1: number, i2: number) {
    [value[i1], value[i2]] = [value[i2], value[i1]];
    update(value);
  }
  function deleteArg(i: number) {
    value.splice(i, 1);
    update(value);
  }
  return (
    <div className="array-input">
      {value.map((item, i) => (
        <div key={i} className="flex mb-1 array-item">
          {children(item, (val) => update(Object.assign(value, { [i]: val })))}
          <button
            type="button"
            disabled={i === 0}
            onClick={() => swapArgs(i, i - 1)}
            className="inline-flex items-center ml-1 mt-0.5 p-1 h-8 border border-transparent rounded-md shadow-sm
                    text-sm font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 hover:text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200
                    disabled:text-gray-500 disabled:cursor-auto disabled:pointer-events-none"
          >
            <ArrowUpIcon className="w-5 h-5 fill-current" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={i === value.length - 1}
            onClick={() => swapArgs(i, i + 1)}
            className="inline-flex items-center ml-1 mt-0.5 p-1 h-8 border border-transparent rounded-md shadow-sm
                    text-sm font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 hover:text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200
                    disabled:text-gray-500 disabled:cursor-auto disabled:pointer-events-none"
          >
            <ArrowDownIcon className="w-5 h-5 fill-current" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => deleteArg(i)}
            className="inline-flex items-center ml-1 mt-0.5 p-1 h-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XIcon className="w-5 h-5 fill-current" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update(value.concat(initialVal))}
        className="inline-flex items-center p-1 text-sm font-medium text-gray-700 bg-gray-300 border border-transparent rounded-md shadow-sm hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <PlusIcon className="w-4 h-4 fill-current" aria-hidden="true" />
        Add
      </button>
    </div>
  );
}

function OptionalInput<T>({ value, update, initialVal, children }: OptionalProps<T>) {
  return (
    <>
      <Switch
        checked={value !== undefined}
        onChange={() => (value === undefined ? update(initialVal) : update(undefined))}
        className={classNames(
          value !== undefined ? "bg-indigo-600" : "bg-gray-400",
          "relative inline-flex items-center h-6 rounded-full w-11 mb-2"
        )}
      >
        <span className="sr-only">Toggle Input Value</span>
        <span
          className={classNames(
            value !== undefined ? "translate-x-6" : "translate-x-1",
            "inline-block w-4 h-4 transform bg-white rounded-full"
          )}
        />
      </Switch>
      <div>{value !== undefined ? children(value, (val) => update(val)) : ""}</div>
    </>
  );
}

function EnumInput({ value, update, enumType }: EnumProps) {
  return (
    <Listbox value={value} onChange={update}>
      <div className="relative">
        <Listbox.Button className="relative w-56 py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <span className="flex items-center">
            <span className="block ml-3 truncate">{}</span>
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 ml-3 pointer-events-none">
            <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-10 w-56 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {Object.entries(enumType)
              .filter(([_, val]) => typeof val === "number")
              .map(([label, val]) => (
                <Listbox.Option
                  key={val}
                  value={val}
                  className={({ active }) =>
                    classNames(
                      active ? "text-white bg-red-600" : "text-gray-900",
                      "cursor-default select-none relative py-2 pl-3 pr-9"
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <span className={classNames(selected ? "font-semibold" : "font-normal", "ml-3 block truncate")}>
                          {label}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={classNames(
                            active ? "text-white" : "text-indigo-600",
                            "absolute inset-y-0 right-0 flex items-center pr-4"
                          )}
                        >
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

function StringInput({ value, update }: BaseProps<string>) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => update(e.target.value)}
      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
}

function IntInput({ value, update }: BaseProps<number>) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => update(parseInt(e.target.value))}
      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
}

function FloatInput({ value, update }: BaseProps<number>) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => update(Number(e.target.value))}
      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
}

function BooleanInput({ value, update }: BaseProps<boolean>) {
  return (
    <Switch
      checked={value}
      onChange={(newValue) => update(newValue)}
      className={classNames(
        value ? "bg-indigo-600" : "bg-gray-400",
        "relative inline-flex items-center h-6 rounded-full w-11"
      )}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={classNames(
          value ? "translate-x-6" : "translate-x-1",
          "inline-block w-4 h-4 transform bg-white rounded-full"
        )}
      />
    </Switch>
  );
}

function PieceInput({ value, update }: BaseProps<T.Piece>) {
  return (
    <div className="gap-2 p-2 ml-2 border border-gray-300 rounded-md">
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">color</label>
        <EnumInput value={value.color} update={(v) => update({ ...value, color: v })} enumType={T.Color} />
      </div>
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">type</label>
        <EnumInput value={value.type} update={(v) => update({ ...value, type: v })} enumType={T.PieceType} />
      </div>
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">square</label>
        <StringInput value={value.square} update={(v) => update({ ...value, square: v })} />
      </div>
    </div>
  );
}

function PlayerInput({ value, update }: BaseProps<T.Player>) {
  return (
    <div className="gap-2 p-2 ml-2 border border-gray-300 rounded-md">
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">id</label>
        <StringInput value={value.id} update={(v) => update({ ...value, id: v })} />
      </div>
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">color</label>
        <EnumInput value={value.color} update={(v) => update({ ...value, color: v })} enumType={T.Color} />
      </div>
    </div>
  );
}

function PlayerStateInput({ value, update }: BaseProps<T.PlayerState>) {
  return (
    <div className="gap-2 p-2 ml-2 border border-gray-300 rounded-md">
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">board</label>
        <ArrayInput<T.Piece>
          value={value.board}
          update={(v) => update({ ...value, board: v })}
          initialVal={T.Piece.default()}
        >
          {(value, update) => <PieceInput value={value} update={update} />}
        </ArrayInput>
      </div>
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">status</label>
        <EnumInput value={value.status} update={(v) => update({ ...value, status: v })} enumType={T.GameStatus} />
      </div>
      <div className="col-span-6 sm:col-span-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">players</label>
        <ArrayInput<T.Player>
          value={value.players}
          update={(v) => update({ ...value, players: v })}
          initialVal={T.Player.default()}
        >
          {(value, update) => <PlayerInput value={value} update={update} />}
        </ArrayInput>
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
    <MethodForm<IJoinGameRequest>
      submit={connection.joinGame.bind(connection)}
      initialize={IJoinGameRequest.default}
    >
      {(value, update) => <div className="grid grid-cols-6 gap-2 pl-2 ml-2 border-l border-gray-300"></div>}
    </MethodForm>
  );
}

