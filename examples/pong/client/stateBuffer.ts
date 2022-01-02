const BUFFER_TIME = 140;

type BufferEntry<T> = { state: T; updatedAt: number };

export class StateBuffer<T> {
  private clientStartTime: number | undefined;
  private buffer: BufferEntry<T>[] = [];

  constructor(private restingState: T, private interpolate: (from: T, to: T, pctElapsed: number) => T) {}

  public enqueue(state: T, updatedAt: number) {
    this.buffer.push({ state, updatedAt: updatedAt + BUFFER_TIME });
  }

  public getInterpolatedState(now: number): T {
    if (this.buffer.length === 0) {
      return this.restingState;
    }

    if (this.buffer[this.buffer.length - 1].updatedAt <= now) {
      this.clientStartTime = undefined;
      this.restingState = this.buffer[this.buffer.length - 1].state;
      this.buffer = [];
      return this.restingState;
    }

    for (let i = this.buffer.length - 1; i >= 0; i--) {
      if (this.buffer[i].updatedAt <= now) {
        this.clientStartTime = undefined;
        this.buffer.splice(0, i);
        return this.lerp(this.buffer[0], this.buffer[1], now);
      }
    }

    if (this.clientStartTime === undefined) {
      this.clientStartTime = now;
    }
    return this.lerp({ state: this.restingState, updatedAt: this.clientStartTime }, this.buffer[0], now);
  }

  private lerp(from: BufferEntry<T>, to: BufferEntry<T>, now: number): T {
    const pctElapsed = (now - from.updatedAt) / (to.updatedAt - from.updatedAt);
    return this.interpolate(from.state, to.state, pctElapsed);
  }
}
