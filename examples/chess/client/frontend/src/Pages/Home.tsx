import { IInitializeRequest } from "../../../../api/types";
import { InitializeForm } from "../Forms";
import Input from "../components/inputField";
import NavBar from "../components/navbar";

const Home = ({ onConnect }: { onConnect: (request: IInitializeRequest) => void }) => {
  
  return (
    <div>
      <NavBar />

      <div>
        <div className="flex home bg-white dark:bg-black flex-col h-screen items-center justify-center  transition duration-500">
          <h1 className="uppercase text-6xl lg:text-8xl xl:text-9xl  font-bold text-indingo dark:text-white">
            <span className="">Ch</span>
            <span className="text-wine">ess</span>
          </h1>
          <h1 className="uppercase text-6xl lg:text-8xl xl:text-9xl text-indingo dark:text-white font-bold">
            <span className="text-wine">Hath</span>ora
          </h1>
          <p className="md:w-3/4 lg:w-1/2 font-semibold text-center dark:text-white text-sm text-indingo">
            Chess is an abstract strategy game and involves no hidden information. It is played on a square chessboard
            with 64 squares arranged in an eight-by-eight grid.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 mt-3">
            <InitializeForm submit={onConnect} />
            <Input />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
