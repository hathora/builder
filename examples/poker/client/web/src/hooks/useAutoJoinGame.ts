import { useEffect } from "react";

import { useHathoraContext } from "../context/GameContext";

export default function useAutoJoinGame(gameId?: string) {
  const { disconnect, joinGame, playerState, token, user, login } = useHathoraContext();

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
}
