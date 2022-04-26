import React from "react";
import PawnIcon from "../../assets/pawn.svg";
import *  as T from "../../../../../api/types";



interface PlayerProps{
  id: string
}

function Player({id, color}: T.Player) {
  
  return (
    <div className="flex text-center flex-col shadow p-2">
      <img src={PawnIcon} alt="Pawn Icon" />
      <p className="text-xs">{id}</p>
      <p>{color}</p>
    </div>
  );
}

export default Player;
