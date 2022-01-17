import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { Direction, PlayerState } from "../.hathora/types";
import { HathoraConnection } from "../.hathora/client";
import { StateBuffer } from "../stateBuffer";

const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_WIDTH = 8;
const PADDLE_HEIGHT = 60;
const MIDLINE_WIDTH = 4;
const BALL_RADIUS = 10;

export default class StateComponent extends LitElement {
  @property() client!: HathoraConnection;
  @property() val!: PlayerState;
  @property() updatedAt!: number;

  private buffer!: StateBuffer<PlayerState>;

  static get styles() {
    return css`
      .game-main {
        font-family: "Press Start 2P", sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .score {
        font-size: 24px;
        flex: 3;
        text-align: center;
      }
    `;
  }

  render() {
    return html`<div class="game-main">
      <div style="width: ${WIDTH}px; padding: 1.5rem; display: flex; justify-content: space-around;">
        <div id="playerAScore" class="score"></div>
        <div id="playerBScore" class="score"></div>
      </div>
      <div style="padding: .5rem; background-color: black;">
        <div
          style="padding: .3rem; border: 5px dashed white; background-color: black; display: flex; align-items: center"
        >
          <canvas width="${WIDTH}" height="${HEIGHT}"></canvas>
        </div>
      </div>
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

      // Draw background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw midline
      ctx.fillStyle = "grey";
      ctx.fillRect(WIDTH / 2 - MIDLINE_WIDTH / 2, 0, MIDLINE_WIDTH, HEIGHT * 2);

      // Draw paddles
      ctx.fillStyle = "white";
      ctx.fillRect(0, state.playerA.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(WIDTH - PADDLE_WIDTH, state.playerB.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillRect(state.ball.x - BALL_RADIUS / 2, state.ball.y, BALL_RADIUS, BALL_RADIUS);

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
