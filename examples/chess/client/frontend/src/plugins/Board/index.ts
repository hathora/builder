import { DragEvent, TouchEvent } from "react";
import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { Board, Color, Piece, PieceType, PlayerState } from "../../../../../api/types";
import { UserData } from "../../../../../api/base";
import { HathoraConnection } from "../../../../.hathora/client";
import "chessboard-element";

export default class BoardEl extends LitElement {
  @property() val!: Board;
  @property() state!: PlayerState;
  @property() user!: UserData;
  @property() client!: HathoraConnection;

  render() {
    const color = this.state.players.find((p) => p.id === this.user.id)?.color;
    return html`<div style="max-width: 500px">
      <chess-board draggable-pieces orientation=${color === Color.BLACK ? "black" : "white"}></chess-board>
    </div>`;
  }

  firstUpdated() {
    const board = this.shadowRoot?.querySelector("chess-board");
    board!.addEventListener("drop", async (ev: any) => {
      const newEvent = ev;
      //@ts-ignore
      const res = await this.client.movePiece({ from: ev.detail.source, to: ev.detail.target });
      console.log({ res });
      console.log({ ev });

      if (res.type === "error") {
        //@ts-ignore
        board?.setPosition(ev.detail.oldPosition);
        this.dispatchEvent(new CustomEvent("error", { detail: res.error }));
      }
    });
  }

  updated() {
    const board = this.shadowRoot?.querySelector("chess-board");
    const position = this.val.reduce((x, piece) => {
      return Object.assign(x, { [piece.square]: pieceToString(piece) });
    }, {});
    board?.setPosition(position);
  }
}

function pieceToString(piece: Piece) {
  const colorStr = (() => {
    switch (piece.color) {
      case Color.WHITE:
        return "w";
      case Color.BLACK:
        return "b";
    }
  })();
  const typeStr = (() => {
    switch (piece.type) {
      case PieceType.PAWN:
        return "P";
      case PieceType.KNIGHT:
        return "N";
      case PieceType.BISHOP:
        return "B";
      case PieceType.ROOK:
        return "R";
      case PieceType.QUEEN:
        return "Q";
      case PieceType.KING:
        return "K";
    }
  })();
  return colorStr + typeStr;
}
