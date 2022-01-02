import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { Direction, PlayerState } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";
import { StateBuffer } from "../stateBuffer";

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

  private buffer!: StateBuffer<PlayerState>;

  render() {
    return html`<div style="display: flex; align-items: center;">
      <div id="playerAScore" style="flex: 3; text-align: center;"></div>
      <canvas width="${WIDTH}" height="${HEIGHT}"></canvas>
      <div id="playerBScore" style="flex: 3; text-align: center;"></div>
    </div>`;
  }

  firstUpdated() {
    this.buffer = new StateBuffer(this.val, lerpState);
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
      this.buffer.enqueue(this.val, this.updatedAt);
    }
  }
}

function lerpState(from: PlayerState, to: PlayerState, pctElapsed: number): PlayerState {
  return {
    playerA: {
      paddle: from.playerA.paddle + (to.playerA.paddle - from.playerA.paddle) * pctElapsed,
      score: pctElapsed < 0.5 ? from.playerA.score : to.playerA.score,
    },
    playerB: {
      paddle: from.playerB.paddle + (to.playerB.paddle - from.playerB.paddle) * pctElapsed,
      score: pctElapsed < 0.5 ? from.playerB.score : to.playerB.score,
    },
    ball: lerp2dEntity(from.ball, to.ball, pctElapsed),
  };
}

function lerp2dEntity<T extends { x: number; y: number }>(from: T, to: T, pctElapsed: number): T {
  return {
    ...from,
    x: from.x + (to.x - from.x) * pctElapsed,
    y: from.y + (to.y - from.y) * pctElapsed,
  };
}
