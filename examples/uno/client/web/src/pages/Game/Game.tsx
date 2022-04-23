import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

import { useHathoraContext } from "../../context/GameContext";
import UnoCard from "../../components/UnoCard/UnoCard";
import MiniCardsRow from "../../components/MinICardCount/MiniCard";

export default function Game() {
  const { gameId } = useParams();
  const { disconnect, joinGame, playerState, token, login, startGame, playCard, drawCard, endGame, getUserName, user } =
    useHathoraContext();
  const navigate = useNavigate();
  let [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // auto join the game once on this page
    if (gameId && token) {
      joinGame(gameId).catch((e) => console.log(e));
    }

    if (!token) {
      // log the user in if they aren't already logged in
      login();
    }
    return disconnect;
  }, [gameId, token]);

  const pile = playerState?.pile;
  const isGameActive = Boolean(playerState?.turn);

  useEffect(() => {
    if (playerState?.winner && isGameActive) {
      setIsOpen(true);
    }
  }, [playerState?.winner, isGameActive]);

  const handleGameEndModalClose = () => {
    setIsOpen(false);
    endGame();
    navigate("/");
  };

  return (
    <>
      <div className="flex flex-row h-full">
        <div className="w-64 flex flex-col overflow-y-auto bg-slate-200 p-5">
          <h2 className="text-5xl tracking-tight font-bold text-gray-900">Players</h2>
          <div className="pt-5">
            {playerState?.players.map((player) => (
              <div
                key={player.id}
                className={`bg-slate-500 text-white shadow shadow-gray-600 p-3 rounded mb-2 ${
                  player.id === playerState?.turn ? "bg-orange-500 border-white border-2" : ""
                }`}
              >
                {getUserName(player.id)} {player.id === user?.id ? "(You)" : ""}
                <div className="mt-5 flex items-end justify-end">
                  <MiniCardsRow count={player.numCards} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-5 flex-1 flex-col bg-gray-100">
          {isGameActive ? (
            <>
              <div className="flex justify-end items-end w-full pr-5">
                <button
                  onClick={() => drawCard()}
                  className="block bg-red-500 border border-red-400 rounded p-2 text-xl font-semibold text-white text-center hover:bg-red-600 h-fit"
                >
                  Draw Card
                </button>
              </div>
              <div className="flex justify-center items-center h-1/2 flex-col">
                <div className="text-lg font-semibold">Pile</div>
                {pile?.color !== undefined && pile?.value && <UnoCard color={pile?.color} value={pile?.value} />}
              </div>
              <div className="h-1/2 flex flex-col justify-center items-center">
                <div className="text-lg font-semibold">Hand</div>
                <div className="hand-row flex max-w-full flex-wrap">
                  {playerState?.hand?.map((card) => (
                    <UnoCard
                      key={`${card.value}_${card.color}`}
                      onClick={() => playCard(card)}
                      color={card.color}
                      value={card.value}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full justify-center items-center">
              <button
                onClick={startGame}
                className="block bg-orange-400 border border-orange-400 rounded p-2 text-xl font-semibold text-white text-center hover:bg-orange-500 h-fit"
              >
                Let's Start the Game
              </button>
            </div>
          )}
        </div>
      </div>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto h-full" onClose={handleGameEndModalClose}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      {playerState?.winner && getUserName(playerState?.winner)} Won!!
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Lets go back to the Home page.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-500 text-base font-medium text-white hover:bg-orange-600 focus:outline-none sm:text-sm"
                    onClick={handleGameEndModalClose}
                  >
                    OK
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
