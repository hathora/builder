import styled from "styled-components";
import {useEffect, useState} from "react";
import {useHathoraContext} from "../context/GameContext";
import {useParams} from "react-router-dom";


const PlayerBoard = styled.div`
  background-color: green;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  
`
const PokerTable = styled.div`
    width: 50vw;
    height: 50vw;
    border-radius: 48%;
    background-color: saddlebrown;
  
    @media(max-width: 486px) {
      width: 70vw;
      height: 40vw;
    }
`

export default function Game() {
    const { gameId } = useParams();
    const { disconnect, joinGame, playerState, token, user, login, endGame, getUserName, connecting } =
        useHathoraContext();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // auto join the game once on this page
        if (gameId && token && !playerState?.players?.find((p) => p.id === user?.id)) {
            joinGame(gameId).catch(console.error);
        }

        if (!token) {
            // log the user in if they aren't already logged in
            login();
        }
        return disconnect;
    }, [gameId, token]);

    return playerState. <PlayerBoard>
        {JSON.stringify(playerState, null, 2)}
        <PokerTable/>
    </PlayerBoard>
}
