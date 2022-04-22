import { useState } from "react";
import {
    IInitializeRequest,
    IJoinGameRequest,
    IMovePieceRequest,
  } from "../../../../../api/types";


export function InitializeForm({ submit }: { submit: (value: IInitializeRequest) => void }) {
    const [value, update] = useState<IInitializeRequest>(IInitializeRequest.default());
    return (
      <>
        <button
          type="button"
          onClick={() => submit(value)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create
        </button>
      </>
    );
  }