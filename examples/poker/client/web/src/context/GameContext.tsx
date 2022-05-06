import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useSessionstorageState } from "rooks";
import { HathoraClient, HathoraConnection } from "../../../.hathora/client";
import { ConnectionFailure } from "../../../.hathora/failures";
import { IInitializeRequest, PlayerState, RoundStatus } from "../../../../api/types";
import { lookupUser, Response, UserData } from "../../../../api/base";

interface GameContext {
  token?: string;
  login: () => Promise<string | undefined>;
  connect: (gameId: string) => HathoraConnection;
  disconnect: () => void;
  createGame: () => Promise<string | undefined>;
  joinGame: (gameId: string) => Promise<void>;
  startGame: () => Promise<void>;
  startRound: () => Promise<void>;
  playerState?: PlayerState;
  connectionError?: ConnectionFailure;
  endGame: () => void;
  getUserName: (id: string) => string;
  user?: UserData;
  connecting?: boolean;
  loggingIn?: boolean;
  fold: () => Promise<void>;
  call: () => Promise<void>;
  raise: (amount: number) => Promise<void>;
}

interface HathoraContextProviderProps {
  children: ReactNode | ReactNode[];
}
const client = new HathoraClient();

const HathoraContext = createContext<GameContext | null>(null);

const handleResponse = async (prom?: Promise<Response>) => {
  const response = await prom;

  if (response?.type === "error") {
    toast.error(response.error, {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  return response;
};

export default function HathoraContextProvider({ children }: HathoraContextProviderProps) {
  const [token, setToken] = useSessionstorageState<string>(client.appId, "");
  const [connection, setConnection] = useState<HathoraConnection>();
  const [playerState, setPlayerState] = useState<PlayerState>();
  const [events, setEvents] = useState<string[]>();
  const [connectionError, setConnectionError] = useState<ConnectionFailure>();
  const [connecting, setConnecting] = useState<boolean>();
  const [loggingIn, setLoggingIn] = useState<boolean>();
  const [playerNameMapping, setPlayerNameMapping] = useSessionstorageState<Record<string, UserData>>(
    `${client.appId}_player_mapping`,
    {}
  );
  const [user, setUserInfo] = useState<UserData>();
  const isLoginIn = useRef(false);

  const login = async () => {
    if (!isLoginIn.current) {
      try {
        setLoggingIn(true);
        isLoginIn.current = true;
        const token = await client.loginAnonymous();
        if (token) {
          const user = HathoraClient.getUserFromToken(token);
          setUserInfo(user);
          setPlayerNameMapping((current) => ({ ...current, [user.id]: user }));
        }
        setToken(token);
        return token;
      } catch (e) {
        console.error(e);
      } finally {
        isLoginIn.current = false;
        setLoggingIn(false);
      }
    }
  };

  const connect = useCallback(
    (stateId: string) => {
      setConnecting(true);
      const connection = client.connect(
        token,
        stateId,
        ({ state }) => {
          setPlayerState(state);
          setConnecting(false);
        },
        (e) => {
          setConnectionError(e);
          setConnecting(false);
        }
      );
      setConnection(connection);
      return connection;
    },
    [token]
  );

  const disconnect = useCallback(() => {
    if (connection !== undefined) {
      connection.disconnect();
      setConnection(undefined);
      setPlayerState(undefined);
      setEvents(undefined);
      setConnectionError(undefined);
    }
  }, [connection]);

  const createGame = useCallback(async () => {
    if (token) {
      return client.create(token, IInitializeRequest.default());
    } else {
      const token = (await login()) ?? "";

      return client.create(token, IInitializeRequest.default());
    }
  }, [token]);

  const joinGame = useCallback(
    async (gameId: string) => {
      const connection = connect(gameId);
      await connection.joinGame({});
    },
    [token, connect]
  );

  const startRound = useCallback(async () => {
    if (connection) {
      await handleResponse(connection.startRound({}));
    }
  }, [connection]);

  const startGame = useCallback(async () => {
    if (connection) {
      if (playerState?.roundStatus === RoundStatus.WAITING) {
        await handleResponse(connection.startGame({ startingChips: 1000, startingBlind: 10 }));
      }
      await startRound();
    }
  }, [connection, playerState]);

  const fold = useCallback(async () => {
    if (connection) {
      await handleResponse(connection.fold({}));
    }
  }, [token, connection]);

  const raise = useCallback(
    async (amount: number) => {
      await handleResponse(connection?.raise({ amount }));
    },
    [token, connection]
  );

  const call = useCallback(async () => {
    if (connection) {
      await handleResponse(connection.call({}));
    }
  }, [token, connection]);

  const endGame = () => {
    setPlayerState(undefined);
    connection?.disconnect();
  };

  useEffect(() => {
    if (connectionError) {
      toast.error(connectionError?.message);
    }
  }, [connectionError]);

  const getUserName = useCallback(
    (userId: string) => {
      if (Boolean(playerNameMapping[userId])) {
        return playerNameMapping[userId].name;
      } else {
        lookupUser(userId).then((response) => {
          setPlayerNameMapping((curr) => ({ ...curr, [userId]: response }));
        });
        return userId;
      }
    },
    [playerNameMapping]
  );

  useEffect(() => {
    if (token) {
      setUserInfo(HathoraClient.getUserFromToken(token));
    }
  }, [token]);

  useEffect(() => {
    if (playerState?.activePlayer && playerState.roundStatus === RoundStatus.ACTIVE) {
      if (playerState?.activePlayer === user?.id) {
        toast.success(`It's your turn`, { position: "top-center", hideProgressBar: true });
      } else {
        toast.info(`it is ${getUserName(playerState?.activePlayer)}'s turn`, {
          position: "top-center",
          hideProgressBar: true,
        });
      }
    }
  }, [playerState?.activePlayer, playerState?.roundStatus]);

  return (
    <HathoraContext.Provider
      value={{
        token,
        login,
        createGame,
        connect,
        connecting,
        joinGame,
        disconnect,
        playerState,
        connectionError,
        startGame,
        startRound,
        loggingIn,
        user,
        endGame,
        getUserName,
        fold,
        raise,
        call,
      }}
    >
      {children}
      <ToastContainer
        autoClose={1000}
        limit={3}
        newestOnTop={true}
        position="top-center"
        pauseOnFocusLoss={false}
        hideProgressBar={true}
      />
    </HathoraContext.Provider>
  );
}

export function useHathoraContext() {
  const context = useContext(HathoraContext);
  if (!context) {
    throw new Error("Component must be within the HathoraContext");
  }
  return context;
}
