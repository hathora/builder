import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { PlayerState } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";

const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;
const BALL_RADIUS = 10;

export default class CardsComponent extends LitElement {
  @property() val!: PlayerState;
  @property() client!: RtagConnection;
  ctx: CanvasRenderingContext2D | undefined;

  render() {
    return html`<canvas width="${WIDTH}" height="${HEIGHT}"></canvas>`;
  }

  firstUpdated() {
    const canvas = this.renderRoot.querySelector("canvas")!;
    this.ctx = canvas.getContext("2d")!;
  }

  updated() {
    const ctx = this.ctx!;
    if (ctx === undefined) {
      return;
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "blue";
    ctx.fillRect(0, this.val.paddleA - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(WIDTH - PADDLE_WIDTH, this.val.paddleB - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.beginPath();
    ctx.arc(this.val.ball.x, this.val.ball.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }
}
