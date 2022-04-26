import React, { Fragment, useState, useContext } from "react";
import { HathoraContext } from "../context";


export function Forms({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
    const { connection } = useContext(HathoraContext)!;
    console.log({ open });
  
    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-40 text-black inset-y-0 right-0 max-w-full pl-10 overflow-hidden"
          onClose={() => {}}
        >
          <div className="absolute inset-0 overflow-hidden">
  
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            </Transition.Child>
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="relative w-screen max-w-lg">
                  <div className="flex flex-col h-full py-6 overflow-y-scroll bg-white shadow-xl">
                    <div className="flex justify-between px-4 sm:px-6">
                      <Dialog.Title className="text-lg font-medium text-gray-900">Methods</Dialog.Title>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center p-1 text-sm font-medium text-gray-700 bg-gray-300 border border-transparent rounded-md shadow-sm hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <XIcon className="w-4 h-4 fill-current" aria-hidden="true" />
                        Close
                      </button>
                    </div>
                    <div className="relative flex-1 px-4 mt-6 sm:px-6">
                      <div className="forms">
                        <MethodForm<IJoinGameRequest>
                          method="joinGame"
                          submit={connection.joinGame.bind(connection)}
                          initialize={IJoinGameRequest.default}
                        >
                          {(value, update) => (
                            <div className="grid grid-cols-6 gap-2 pl-2 ml-2 border-l border-gray-300"></div>
                          )}
                        </MethodForm>
                        <MethodForm<IMovePieceRequest>
                          method="movePiece"
                          submit={connection.movePiece.bind(connection)}
                          initialize={IMovePieceRequest.default}
                        >
                          {(value, update) => (
                            <div className="grid grid-cols-6 gap-2 pl-2 ml-2 border-l border-gray-300">
                              <div className="col-span-6 sm:col-span-4">
                                <label className="block mt-2 mb-1 text-sm font-medium text-gray-700">from</label>
                                <StringInput value={value.from} update={(v) => update({ ...value, from: v })} />
                              </div>
                              <div className="col-span-6 sm:col-span-4">
                                <label className="block mt-2 mb-1 text-sm font-medium text-gray-700">to</label>
                                <StringInput value={value.to} update={(v) => update({ ...value, to: v })} />
                              </div>
                            </div>
                          )}
                        </MethodForm>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }
  