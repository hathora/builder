import styled from "styled-components";
import { useState } from "react";
import { useWindowSize } from "rooks";
import classNames from "classnames";

import { useHathoraContext } from "../context/GameContext";
import { CardComponent } from "./CardComponent";
import { rankConversion } from "../constants/rankConversion";
import { PlayerStatus, RoundStatus } from "../../../../api/types";

const PlayerBoard = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const PokerTable = styled.div`
  margin-top: 80px;
  width: 600px;
  position: relative;
  height: 600px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  margin-bottom: 5rem;
  border-radius: 50%;
  background-color: #154b0a;
  border: 0.75rem solid #6b342b;

  @media (max-width: 486px) {
    width: 90%;
    height: 200px;
    border-radius: 5vw;
    margin-bottom: 2rem;
  }

  .position-hold {
    transition: transform 2s linear;
    position: absolute;
    left: 200px; /* calculate circle width / 2 - .square width / 2 */
    top: 250px;
  }
`;

const OpponentWrapper = styled.div<{ index: number; size: number }>`
  background-color: white;
  min-width: 250px;
  position: absolute;
  left: 0;
`;

const BuildCircle = (num: number) => {
  const type = 1;
  let radius = "300"; //distance from center
  let start = -90; //shift start from 0
  let slice = (360 * type) / num;

  let items = [];
  let i;
  for (i = 0; i < num; i++) {
    let rotate = slice * i + start;
    let rotateReverse = rotate * -1;

    items.push({
      radius: radius,
      rotate: rotate,
      rotateReverse: rotateReverse,
    });
  }

  return items;
};

const PotWrapper = styled.div`
  position: absolute;
  top: 35%;
  left: 0;
  width: 100%;
  display: flex;

  @media (max-width: 486px) {
    top: 0;
  }
`;

export default function ActiveGame() {
  const { playerState, user, raise, fold, call, getUserName, startRound, endGame } = useHathoraContext();
  const [raiseAmount, setRaiseAmount] = useState(100);

  const { outerWidth } = useWindowSize();
  const isMobile = (outerWidth || 0) <= 486;

  const currentUserIndex = playerState?.players.findIndex((p) => p.id === user?.id);
  const currentUser = currentUserIndex !== undefined ? playerState?.players[currentUserIndex] : undefined;

  const players = [
    ...(playerState?.players.slice(currentUserIndex || 0, playerState.players.length) || []),
    ...(playerState?.players.slice(0, currentUserIndex) || []),
  ];

  const handleRaise = () => {
    raise(raiseAmount);
  };

  const circles = BuildCircle(players.length);
  const pot = playerState?.players?.reduce((accum, player) => accum + player.chipsInPot, 0) ?? 0;
  const isRoundOver = playerState?.roundStatus === RoundStatus.COMPLETED;
  const isRoundActive = playerState?.roundStatus === RoundStatus.ACTIVE;
  const maxChipsInPot =
    playerState?.players.reduce((max, player) => (player.chipsInPot > max ? player.chipsInPot : max), 0) || 0;

  const callAmount = maxChipsInPot - (currentUser?.chipsInPot ?? 0);
  const isCurrentPlayer = playerState?.activePlayer === currentUser?.id;
  return (
    <div className="flex flex-col items-center justify-center py-5 bg-slate-100">
      <PlayerBoard>
        <div className="flex justify-center w-full item-center">
          <PokerTable>
            <PotWrapper className="items-center justify-center font-semibold text-white">
              Current Pot: ${pot}
            </PotWrapper>
            {playerState?.revealedCards.map((card, index) => (
              <CardComponent
                size={isMobile ? 40 : 80}
                key={index}
                card={`${rankConversion[card.rank]}${card.suit[0]}`}
              />
            ))}
            {!isMobile && (
              <div className="position-hold">
                {players.map((player, index) => {
                  const css = circles[index];

                  return (
                    <OpponentWrapper
                      style={{
                        transform:
                          "rotate(" +
                          css.rotate +
                          "deg) translate(" +
                          css.radius +
                          "px) rotate(" +
                          css.rotateReverse +
                          "deg)",
                      }}
                      key={player.id}
                      className={`rounded border shadow p-3 text-xs ${
                        player.id === playerState?.activePlayer ? "border-orange-400 border-4 shadow-orange-800" : ""
                      }`}
                      index={index}
                      size={players.length}
                    >
                      <div className="flex flex-col">
                        <div className="font-bold">
                          {player.id === user?.id ? "⭐ " : ""}
                          {getUserName(player.id)}
                        </div>
                        {player.id === playerState?.activePlayer && player.status !== PlayerStatus.WON
                          ? "(Current Player)"
                          : ""}
                        {player.status === PlayerStatus.WON ? "(Winner)" : ""}
                      </div>
                      <div className="flex flex-col">
                        <div>
                          <span className="font-bold">In pot:</span> ${player.chipsInPot}{" "}
                        </div>
                        <div>
                          <span className="font-bold">Chips:</span> ${player.chipCount}{" "}
                        </div>
                      </div>
                      <div className="flex">
                        {player?.cards?.map((card, index) => (
                          <CardComponent key={index} card={`${rankConversion[card.rank]}${card.suit[0]}`} />
                        ))}
                      </div>
                    </OpponentWrapper>
                  );
                })}
              </div>
            )}
          </PokerTable>
        </div>
        {isMobile && (
          <div className="flex flex-col w-full px-5">
            {players
              .filter((player) => player)
              .map((player) => (
                <div
                  className={`w-full bg-white p-3 rounded border shadow drop-shadow mb-5 ${
                    player.id === playerState?.activePlayer ? "border-orange-400 border-4 shadow-orange-800" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="font-bold">
                      {player.id === user?.id ? "⭐ " : ""}
                      {getUserName(player.id)}
                    </div>
                    {player.id === playerState?.activePlayer && isRoundActive ? "(Current Player)" : ""}
                    {player.status === PlayerStatus.WON && isRoundOver ? "(Winner)" : ""}
                  </div>
                  <div className="flex flex-col">
                    <div>
                      <span className="font-bold">In pot:</span> ${player.chipsInPot}{" "}
                    </div>
                    <div>
                      <span className="font-bold">Chips:</span> ${player.chipCount}{" "}
                    </div>
                  </div>
                  <div className="flex">
                    {player?.cards?.map((card, index) => (
                      <CardComponent key={index} card={`${rankConversion[card.rank]}${card.suit[0]}`} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
        {currentUser && (
          <div className={`flex flex-col w-full md:w-3/4 lg:w-1/2 ${isRoundOver ? "md:mt-32" : ""}`}>
            {playerState?.roundStatus === RoundStatus.ACTIVE && (
              <>
                <div className="flex flex-col w-full px-5 mt-3 md:flex-row">
                  <div className="mb-2 font-semibold md:hidden">Raise</div>
                  <input
                    disabled={!isCurrentPlayer}
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                    type="number"
                    placeholder="Raise"
                    className="flex-1 w-full px-5 py-3 mb-5 placeholder-gray-500 border-gray-300 rounded shadow focus:ring-indigo-500 focus:border-indigo-500 focus:border-r-0 md:mb-0 md:mr-2"
                  />
                  <button
                    disabled={!isCurrentPlayer}
                    onClick={handleRaise}
                    className={classNames(
                      "block md:w-1/3 bg-green-600 border border-green-600 rounded lg:rounded-r lg:rounded-l-0 p-2 text-xl font-semibold text-white text-center shadow",
                      {
                        "opacity-50": !isCurrentPlayer,
                        "hover:bg-green-900": isCurrentPlayer,
                      }
                    )}
                  >
                    Raise
                  </button>
                </div>
                <div className="flex flex-col items-center px-5 mb-3 md:flex-row lg:w-50">
                  <button
                    disabled={!isCurrentPlayer}
                    className={classNames(
                      `mt-3 md:mr-1 w-full block bg-blue-800 border border-blue-800 rounded p-2 text-xl font-semibold text-white text-center h-fit`,
                      {
                        "opacity-50": !isCurrentPlayer,
                        "hover:bg-blue-900": isCurrentPlayer,
                      }
                    )}
                    onClick={call}
                  >
                    Call (${callAmount})
                  </button>
                  <button
                    disabled={!isCurrentPlayer}
                    onClick={fold}
                    className={classNames(
                      `mt-3 md:ml-1 w-full block bg-red-800 border border-red-800 rounded p-2 text-xl font-semibold text-white text-center h-fit`,
                      {
                        "opacity-50": !isCurrentPlayer,
                        "hover:bg-red-900": isCurrentPlayer,
                      }
                    )}
                  >
                    Fold
                  </button>
                </div>
              </>
            )}
            {isRoundOver && (
              <div className="w-full px-5 mb-10">
                <button
                  onClick={startRound}
                  className="block w-full p-2 mt-3 text-xl font-semibold text-center text-white bg-orange-600 border border-orange-600 rounded md:mr-1 hover:bg-orange-900 h-fit"
                >
                  Next Round
                </button>
              </div>
            )}
          </div>
        )}
      </PlayerBoard>
    </div>
  );
}
