import { useState } from "react";
import Input from "../components/inputField";
import KnightIcon from "../assets/Knight.svg";
import { HathoraClient, HathoraConnection, UpdateArgs } from "../../../.hathora/client";
import { ToastContainer, Zoom, toast } from "react-toastify";


import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";


const Home = () => {
  const client = new HathoraClient();

  const [token, setToken] = useState<string | undefined>(sessionStorage.getItem(client.appId) ?? undefined);
  const [stateId, setStateId] = useState<string>("");

  const navigate = useNavigate();

  // click function to login and create a new game
  const handleCreateButton = () => {
    // login as anonymous
    client
      .loginAnonymous()
      .then((token) => {
        sessionStorage.setItem(client.appId, token);
        setToken(token);
        navigate(`/state/${stateId}`);
        console.log(token);
      })
      .catch((e) =>
        toast.error("Authentication failed:" + e.reason, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      );
      
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStateId(e.target.value);
  };
  return (
    <div className="flex home dark:bg-black flex-col h-screen pt-28 items-center  transition duration-500">
      <h1 className="uppercase text-6xl lg:text-8xl xl:text-9xl  font-bold text-indingo dark:text-white">
        <span className="">Ch</span>
        <span className="text-wine">ess</span>
      </h1>
      <h1 className="uppercase text-6xl lg:text-8xl xl:text-9xl text-indingo dark:text-white font-bold">
        <span className="text-wine">Hath</span>ora
      </h1>
      <p className="md:w-3/4 lg:w-1/2 font-semibold text-center dark:text-white text-sm text-indingo">
        Chess is an abstract strategy game and involves no hidden information. It is played on a square chessboard with
        64 squares arranged in an eight-by-eight grid.
      </p>
      <div className="flex flex-col md:flex-row items-center gap-4 mt-3">
        <button
          className="font-semibold bg-wine items-center rounded px-5 text-white py-2 flex gap-2"
          onClick={handleCreateButton}
        >
          <img src={KnightIcon} alt="Knight Ion" />
          <span className="text-lg">New Game</span>
        </button>
        <Input />
      </div>
    </div>
  );
};

export default Home;
