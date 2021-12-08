import { PlayerState } from "./.rtag/types";

export class StateBuffer {
  private clientStartTime: number | undefined;
  private buffer: PlayerState[] = [];

  constructor(private restingState: PlayerState) {}

  public enqueue(state: PlayerState) {
    this.buffer.push(state);
  }

  public getInterpolatedState(now: number): PlayerState {
    if (this.buffer.length === 0) {
      return this.restingState;
    }

    if (this.buffer[this.buffer.length - 1].updatedAt <= now) {
      this.clientStartTime = undefined;
      this.restingState = this.buffer[this.buffer.length - 1];
      this.buffer = [];
      return this.restingState;
    }

    for (let i = this.buffer.length - 1; i >= 0; i--) {
      if (this.buffer[i].updatedAt <= now) {
        this.clientStartTime = undefined;
        this.buffer.splice(0, i);
        return lerp(this.buffer[0], this.buffer[1], now);
      }
    }

    if (this.clientStartTime === undefined) {
      this.clientStartTime = now;
    }
    return lerp({ ...this.restingState, updatedAt: this.clientStartTime }, this.buffer[0], now);
  }
}

function lerp(from: PlayerState, to: PlayerState, now: number): PlayerState {
  const pctElapsed = (now - from.updatedAt) / (to.updatedAt - from.updatedAt);
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
    updatedAt: now,
  };
}

function lerp2dEntity<T extends { x: number; y: number }>(from: T, to: T, pctElapsed: number): T {
  return {
    ...from,
    x: from.x + (to.x - from.x) * pctElapsed,
    y: from.y + (to.y - from.y) * pctElapsed,
  };
}
