import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { Direction, PlayerState } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";

const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_WIDTH = 5;
const PADDLE_HEIGHT = 50;
const BALL_RADIUS = 10;

export default class CardsComponent extends LitElement {
  @property() val!: PlayerState;
  @property() client!: RtagConnection;

  ctx: CanvasRenderingContext2D | undefined;
  playerAScoreEl: Element | undefined;
  playerBScoreEl: Element | undefined;

  render() {
    return html`<div style="display: flex; align-items: center;">
      <div id="playerAScore" style="flex: 3; text-align: center;"></div>
      <canvas width="${WIDTH}" height="${HEIGHT}"></canvas>
      <div id="playerBScore" style="flex: 3; text-align: center;"></div>
    </div>`;
  }

  firstUpdated() {
    this.ctx = this.renderRoot.querySelector("canvas")!.getContext("2d")!;
    this.playerAScoreEl = this.renderRoot.querySelector("div#playerAScore")!;
    this.playerBScoreEl = this.renderRoot.querySelector("div#playerBScore")!;

    document.addEventListener("keydown", (e) => {
      if (e.repeat) {
        return;
      }
      if (e.key === "ArrowUp") {
        this.client.setDirection({ direction: Direction.UP });
      } else if (e.key === "ArrowDown") {
        this.client.setDirection({ direction: Direction.DOWN });
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        this.client.setDirection({ direction: Direction.NONE });
      }
    });
  }

  updated() {
    const ctx = this.ctx!;
    if (ctx === undefined) {
      return;
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "blue";
    ctx.fillRect(0, this.val.playerA.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(WIDTH - PADDLE_WIDTH, this.val.playerB.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.beginPath();
    ctx.arc(this.val.ball.x, this.val.ball.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    this.playerAScoreEl!.textContent = this.val.playerA.score.toString();
    this.playerBScoreEl!.textContent = this.val.playerB.score.toString();
  }
}
