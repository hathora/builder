import { useNavigate } from "react-router-dom";
import { useHathoraContext } from "../../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { login, token, createGame } = useHathoraContext();
  return (
    <div className="h-full bg-slate-800 flex justify-center items-center">
      {!token ? (
        <div className="flex rounded bg-slate-500 justify-center items-center h-3/4 w-3/4">
          <button
            onClick={login}
            className="block bg-gray-800 border border-gray-800 rounded-md p-2 text-6xl font-semibold text-white text-center hover:bg-gray-900 h-fit"
          >
            GET STARTED!
          </button>
        </div>
      ) : (
        <div className="flex rounded bg-slate-500 justify-center items-center h-3/4 w-3/4">
          <button
            onClick={() => {
              createGame().then((stateId) => {
                navigate(`/game/${stateId}`);
              });
            }}
            className="block bg-gray-800 border border-gray-800 rounded-md p-2 text-6xl font-semibold text-white text-center hover:bg-gray-900 h-fit"
          >
            Create Game
          </button>
          <input />
          <button className="block bg-gray-800 border border-gray-800 rounded-md p-2 text-6xl font-semibold text-white text-center hover:bg-gray-900 h-fit">
            Join Existing Game
          </button>
        </div>
      )}
    </div>
  );
}
