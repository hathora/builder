import React from "react";
import { UserData } from "./base";
import { RtagConnection } from "./client";
import { PlayerState as UserState } from "./types";

type RtagContext = { connection: RtagConnection; user: UserData; state: UserState; updatedAt: number } | undefined;
export const RtagContext = React.createContext<RtagContext>(undefined);
