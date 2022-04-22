import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { HathoraClient, HathoraConnection, UpdateArgs } from "../../../.hathora/client";
import { ConnectionFailure } from "../../../.hathora/failures";

import useSessionStorage from "../hooks/useSessionStorage";

import { IInitializeRequest } from "../../../../api/types";

interface AuthContext {
  token?: string;
  login: () => Promise<void>;
  connect: (gameId: string) => HathoraConnection;
  disconnect: () => void;
  createGame: () => Promise<string>;
  joinGame: (gameId: string) => Promise<void>;
  playerState?: UpdateArgs["state"];
  connectionError?: ConnectionFailure;
}

interface AuthContextProviderProps {
  children: ReactNode | ReactNode[];
}
const client = new HathoraClient();

const HathoraContext = createContext<AuthContext | null>(null);

export default function HathoraContextProvider({ children }: AuthContextProviderProps) {
  const [token, setToken] = useSessionStorage<string>(client.appId);
  const [connection, setConnection] = useState<HathoraConnection>();
  const [playerState, setPlayerState] = useState<UpdateArgs["state"]>();
  const [events, setEvents] = useState<UpdateArgs["events"]>();
  const [connectionError, setConnectionError] = useState<ConnectionFailure>();
  const isLogginIn = useRef(false);
  const login = async () => {
    if (!isLogginIn.current) {
      try {
        isLogginIn.current = true;
        const token = await client.loginAnonymous();
        setToken(token);
      } catch (e) {
        console.error(e);
      } finally {
        isLogginIn.current = false;
      }
    }
  };

  const connect = useCallback(
    (stateId: string) => {
      const connection = client.connect(
        token,
        stateId,
        ({ state }) => {
          setPlayerState(state);
        },
        setConnectionError
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

  const createGame = async () => {
    return await client.create(token, IInitializeRequest.default());
  };

  const joinGame = useCallback(
    async (gameId: string) => {
      const connection = await connect(gameId);
      await connection.joinGame({});
    },
    [token, connect]
  );

  const startGame = useCallback(
    async (gameId: string) => {
      if (connection) {
        await connection.startGame({});
      }
    },
    [token, connection]
  );

  return (
    <HathoraContext.Provider
      value={{ token, login, connect, joinGame, disconnect, createGame, playerState, connectionError, startGame }}
    >
      {children}
    </HathoraContext.Provider>
  );
}

export function useHathoraContext() {
  const context = useContext(HathoraContext);
  if (!context) {
    throw new Error("Component must be within the Auth Context");
  }
  return context;
}
