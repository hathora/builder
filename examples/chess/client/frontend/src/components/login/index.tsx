import { toast } from "react-toastify";
import { HathoraClient } from "../../../../.hathora/client";


const client = new HathoraClient();


const  Login=({ setToken }: { setToken: (token: string) => void }) =>{
    return (
      <div className="flex flex-col w-full h-screen bg-white dark:bg-black justify-center text-center items-center">
        <div className=" m-auto">
          <div className="flex flex-col mt-2">
            <div className=" mb-4">
              <button
                type="button"
                onClick={() =>
                  client
                    .loginAnonymous()
                    .then((token) => {
                      sessionStorage.setItem(client.appId, token);
                      setToken(token);
                      
                    })
                    .catch((e) => toast.error("Authentication error: " + e.reason))
                    
                }
                className="inline-flex items-center px-4 py-2 text-sm  font-medium text-white bg-wine border border-transparent rounded shadow-sm hover:bg-indingo "
              >
                Login (Anonymous)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  export default Login;