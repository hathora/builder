import { useHathoraContext } from "../context/GameContext";
import "playing-card";

import styled from "styled-components";
import { useState } from "react";
import { useWindowSize } from "rooks";
import { rankConversion } from "../constants/rankConversion";
import { PlayerStatus, RoundStatus } from "../../../../api/types";

const PlayerBoard = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;

  playing-card {
    --card-size: 4rem;
    margin: 0.5rem;

    @media (max-width: 486px) {
      --card-size: 3rem;
    }
  }
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

  playing-card {
    --card-size: 2rem;
    margin: 0.5rem;

    @media (max-width: 486px) {
      --card-size: 1.2rem;
    }
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
  const { playerState, user, raise, fold, call, getUserName, startRound } = useHathoraContext();
  const [raiseAmount, setRaiseAmount] = useState(100);

  const { outerWidth } = useWindowSize();
  const isMobile = (outerWidth || 0) <= 486;

  const currentUserIndex = playerState?.players.findIndex((p) => p.id === user?.id) ?? 0;

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

  console.log(playerState);

  return (
    <div className="bg-slate-100 flex flex-col py-5 items-center justify-center">
      {isRoundOver && (
        <div className="w-full flex justify-end px-5">
          <button
            onClick={startRound}
            className="block md:w-1/5 bg-orange-600 border border-orange-600 rounded lg:rounded-r lg:rounded-l-0 p-2 text-xl font-semibold text-white text-center hover:bg-orange-900 shadow"
          >
            Start Round
          </button>
        </div>
      )}
      <PlayerBoard>
        <div className="w-full flex item-center justify-center">
          <PokerTable>
            <PotWrapper className="justify-center items-center text-white font-semibold">
              Current Pot: ${pot}
            </PotWrapper>
            {playerState?.revealedCards.map((card, index) => (
              <playing-card key={index} rank={rankConversion[card.rank]} suit={card.suit[0]}></playing-card>
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
                          <playing-card
                            // @ts-ignore need to type the global declaration
                            style={{ "--card-size": "2rem" }}
                            key={index}
                            rank={rankConversion[card.rank]}
                            suit={card.suit[0]}
                          ></playing-card>
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
          <div className="flex w-full px-5 flex-col">
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
                      <playing-card
                        // @ts-ignore need to type the global declaration
                        style={{ "--card-size": "2rem" }}
                        key={index}
                        rank={rankConversion[card.rank]}
                        suit={card.suit[0]}
                      ></playing-card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
        {playerState?.roundStatus === RoundStatus.ACTIVE && (
          <>
            <div className="flex md:flex-row flex-col w-full mt-3 px-5">
              <input
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                type="number"
                placeholder="Raise"
                className="w-full flex-1 px-5 shadow py-3 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 focus:border-r-0 border-gray-300 rounded-l md:rounder-r-0 md:mb-0 mb-5"
              />
              <button
                onClick={handleRaise}
                className="block md:w-1/3 bg-green-600 border border-green-600 rounded lg:rounded-r lg:rounded-l-0 p-2 text-xl font-semibold text-white text-center hover:bg-green-900 shadow"
              >
                Raise
              </button>
            </div>
            <div className="flex w-full flex-col md:flex-row px-5 items-center mb-5">
              <button
                onClick={call}
                className="mt-3 md:mr-1 w-full block bg-blue-800 border border-blue-800 rounded p-2 text-xl font-semibold text-white text-center hover:bg-blue-900 h-fit"
              >
                Call
              </button>
              <button
                onClick={fold}
                className="mt-3 md:ml-1 w-full block bg-red-800 border border-red-800 rounded p-2 text-xl font-semibold text-white text-center hover:bg-red-900 h-fit"
              >
                Fold
              </button>
            </div>
          </>
        )}
      </PlayerBoard>
    </div>
  );
}
