import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { Direction, PlayerState } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";
import { StateBuffer } from "../stateBuffer";

const BUFFER_TIME = 140;
const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_WIDTH = 5;
const PADDLE_HEIGHT = 50;
const BALL_RADIUS = 10;

export default class StateComponent extends LitElement {
  @property()
  client!: RtagConnection;
  @property()
  val!: PlayerState;
  @property()
  updatedAt!: number;

  private buffer!: StateBuffer;

  render() {
    return html`<div style="display: flex; align-items: center;">
      <div id="playerAScore" style="flex: 3; text-align: center;"></div>
      <canvas width="${WIDTH}" height="${HEIGHT}"></canvas>
      <div id="playerBScore" style="flex: 3; text-align: center;"></div>
    </div>`;
  }

  firstUpdated() {
    this.buffer = new StateBuffer(this.val);
    const ctx = this.renderRoot.querySelector("canvas")!.getContext("2d")!;
    const playerAScoreEl = this.renderRoot.querySelector("div#playerAScore")!;
    const playerBScoreEl = this.renderRoot.querySelector("div#playerBScore")!;

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

    const draw = () => {
      const state = this.buffer.getInterpolatedState(Date.now());

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "blue";
      ctx.fillRect(0, state.playerA.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(WIDTH - PADDLE_WIDTH, state.playerB.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

      playerAScoreEl.textContent = state.playerA.score.toString();
      playerBScoreEl.textContent = state.playerB.score.toString();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  updated() {
    if (this.updatedAt > 0) {
      this.buffer.enqueue(this.val, this.updatedAt + BUFFER_TIME);
    }
  }
}
