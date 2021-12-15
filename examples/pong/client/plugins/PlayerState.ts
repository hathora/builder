import "@fontsource/press-start-2p";
import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { Direction, PlayerState } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";
import { StateBuffer } from "../stateBuffer";

const BUFFER_TIME = 200;
const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_WIDTH = 8;
const PADDLE_HEIGHT = 60;
const MIDLINE_WIDTH = 4;
const BALL_RADIUS = 10;

export default class CardsComponent extends LitElement {
  @property() val!: PlayerState;
  @property() client!: RtagConnection;

  buffer!: StateBuffer;

  static get styles() {
    const mainColor = 'red';

    return css`
      .game-main {
        font-family: "Press Start 2P", sans-serif;
      }
    `;
  }

  render() {
    return html`<div class="game-main" style="display: flex; flex-direction:column; align-items: center;">
      <div style="width: ${WIDTH}px; padding: 1.5rem; display: flex; justify-content: space-around;">
        <div id="playerAScore" style="font-size: 24px; flex: 3; text-align: center;"></div>
        <div id="playerBScore" style="font-size: 24px; flex: 3; text-align: center;"></div>
      </div>

      <div style="padding: .5rem; background-color: black;">
        <div style="padding: .3rem; border: 5px dashed white; background-color: black; display: flex; align-items: center">
          <canvas width="${WIDTH}" height="${HEIGHT}"></canvas>
        </div>
      </div>
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

      // Draw background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw midline
      ctx.fillStyle = "grey";
      ctx.fillRect((WIDTH/2) - (MIDLINE_WIDTH/2), 0, MIDLINE_WIDTH, HEIGHT * 2);

      // Draw paddles
      ctx.fillStyle = "white";
      ctx.fillRect(0, state.playerA.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(WIDTH - PADDLE_WIDTH, state.playerB.paddle - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillRect(state.ball.x - (BALL_RADIUS/2), state.ball.y, BALL_RADIUS, BALL_RADIUS);

      playerAScoreEl!.textContent = state.playerA.score.toString();
      playerBScoreEl!.textContent = state.playerB.score.toString();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  updated() {
    this.buffer.enqueue({ ...this.val, updatedAt: this.val.updatedAt + BUFFER_TIME });
  }
}
