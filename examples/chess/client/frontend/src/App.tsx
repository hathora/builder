import Game from './Pages/Game';
import Home from './Pages/Home';
import Login from './components/login';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
  } from 'react-router-dom';
import { ConnectionFailure } from '../../.hathora/failures';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { HathoraContext } from './context';
import { IInitializeRequest } from '../../../api/types';
import { InitializeForm, JoinGameButton } from './Forms';
import { State } from './State';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { UserData } from '../../../api/base';
import 'react-toastify/dist/ReactToastify.css';
// components

// Pages

const client = new HathoraClient();

export default function App() {
  const [token, setToken] = useState<string | undefined>(sessionStorage.getItem(client.appId) ?? undefined);
  const [connection, setConnection] = useState<HathoraConnection>();
  const [updateArgs, setUpdateArgs] = useState<UpdateArgs>();
  const [connectionError, setConnectionError] = useState<ConnectionFailure>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash.length > 0) {
      sessionStorage.setItem(client.appId, location.hash.substring(1));
      setToken(location.hash.substring(1));
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const user = token !== undefined ? HathoraClient.getUserFromToken(token) : undefined;

  return (
    <div id="app bg:white dark:bg-black">
      {token === undefined || user === undefined ? (
        <Login setToken={setToken} />
      ) : (
        <Routes>
          <Route
            path="/state/:stateId"
            element={
              <Game
                user={user}
                connection={connection}
                updateArgs={updateArgs}
                connectionError={connectionError}
                onConnect={(stateId) =>
                  setConnection(client.connect(token, stateId, setUpdateArgs, setConnectionError))
                }
                onDisconnect={() => {
                  if (connection !== undefined) {
                    connection.disconnect();
                    setConnection(undefined);
                    setUpdateArgs(undefined);
                    setConnectionError(undefined);
                  }
                }}
              />
            }
          >
            {/* <Game
              user={user}
              connection={connection}
              updateArgs={updateArgs}
              connectionError={connectionError}
              onConnect={(stateId) => setConnection(client.connect(token, stateId, setUpdateArgs, setConnectionError))}
              onDisconnect={() => {
                if (connection !== undefined) {
                  connection.disconnect();
                  setConnection(undefined);
                  setUpdateArgs(undefined);
                  setConnectionError(undefined);
                }
              }}
            /> */}
          </Route>
          <Route
            path="/"
            element={<Home onConnect={async (request) => navigate(`/state/${await client.create(token, request)}`)} />}
          />
          {/* <Route
              path="/"
              element={
                <Home onConnect={async (request) => navigate(`/state/${await client.create(token, request)}`)} />
              }
            />
            <Route path="*" element={<div>Not Found</div>} /> */}
        </Routes>
      )}
    </div>
  );
}