import axios from "axios";
import { UserId } from "./types";

export enum Method {
  START_GAME,
  MOVE_PIECE,
}
export interface OkResponse {
  type: "ok";
}
export interface ErrorResponse {
  type: "error";
  error: string;
}
export type Response = OkResponse | ErrorResponse;
export const Response: { ok: () => OkResponse; error: (error: string) => ErrorResponse } = {
  ok: () => ({
    type: "ok",
  }),
  error: (error: string) => ({
    type: "error",
    error,
  }),
};
export interface AnonymousUserData {
  type: "anonymous";
  id: string;
  name: string;
}
export type UserData = AnonymousUserData;

export function lookupUser(userId: UserId): Promise<UserData> {
  return axios.get<UserData>(`https://rtag.dev/users/${userId}`).then((res) => res.data);
}

export function getUserDisplayName(user: UserData) {
  switch (user.type) {
    case "anonymous":
      return user.name;
  }
}
