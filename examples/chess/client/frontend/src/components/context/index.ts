import React from "react";
import { UserData } from "../../../../../api/base";
import { PlayerState as UserState } from "../../../../../api/types";
import { HathoraConnection } from "../../../../.hathora/client";

type HathoraContext = {
  user: UserData;
  connection: HathoraConnection;
  state: UserState;
  updatedAt: number;
  pluginsAsObjects: boolean;
};

export const HathoraContext = React.createContext<HathoraContext | undefined>(undefined);
