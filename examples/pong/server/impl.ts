import { Methods, Context } from "./.rtag/methods";
import { Response } from "./.rtag/base";
import { UserId, Direction, PlayerState, ICreateGameRequest, ISetDirectionRequest } from "./.rtag/types";

const MAP_WIDTH = 600;
const MAP_HEIGHT = 400;
const PADDLE_HEIGHT = 60;
const PADDLE_SPEED = 100;
const BALL_SPEED = 250;

type InternalState = {
  playerA: { id: string; direction: Direction; paddle: number; score: number };
  playerB: { id?: string; direction: Direction; paddle: number; score: number };
  ball: { x: number; y: number; angle: number };
  updatedAt: number;
};

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      playerA: {
        id: userId,
        direction: Direction.NONE,
        paddle: MAP_HEIGHT / 2,
        score: 0,
      },
      playerB: {
        direction: Direction.NONE,
        paddle: MAP_HEIGHT / 2,
        score: 0,
      },
      ball: {
        x: MAP_WIDTH / 2,
        y: MAP_HEIGHT / 2,
        angle: ctx.rand() * 2 * Math.PI,
      },
      updatedAt: 0,
    };
  }
  setDirection(state: InternalState, userId: UserId, ctx: Context, request: ISetDirectionRequest): Response {
    if (state.playerA.id === userId) {
      state.playerA.direction = request.direction;
      return Response.ok();
    } else if (state.playerB.id === userId) {
      state.playerB.direction = request.direction;
      return Response.ok();
    } else if (state.playerB.id === undefined) {
      state.playerB.id = userId;
      state.playerB.direction = request.direction;
      return Response.ok();
    } else {
      return Response.error("Not in game");
    }
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return {
      playerA: state.playerA,
      playerB: state.playerB,
      ball: state.ball,
      updatedAt: state.updatedAt,
    };
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {
    if (state.playerA.direction !== Direction.NONE) {
      state.playerA.paddle += PADDLE_SPEED * timeDelta * (state.playerA.direction === Direction.DOWN ? 1 : -1);
      state.updatedAt = ctx.time();
    }
    if (state.playerB.direction !== Direction.NONE) {
      state.playerB.paddle += PADDLE_SPEED * timeDelta * (state.playerB.direction === Direction.DOWN ? 1 : -1);
      state.updatedAt = ctx.time();
    }

    if (state.playerB.id === undefined) {
      return;
    }
    state.ball.x += Math.cos(state.ball.angle) * BALL_SPEED * timeDelta;
    state.ball.y += Math.sin(state.ball.angle) * BALL_SPEED * timeDelta;
    if (state.ball.x < 0) {
      if (
        state.ball.y < state.playerA.paddle - PADDLE_HEIGHT / 2 ||
        state.ball.y > state.playerA.paddle + PADDLE_HEIGHT / 2
      ) {
        state.playerB.score++;
      }
      state.ball.x = 0;
      state.ball.angle = Math.PI - state.ball.angle;
    }
    if (state.ball.x >= MAP_WIDTH) {
      if (
        state.ball.y < state.playerB.paddle - PADDLE_HEIGHT / 2 ||
        state.ball.y > state.playerB.paddle + PADDLE_HEIGHT / 2
      ) {
        state.playerA.score++;
      }
      state.ball.x = MAP_WIDTH - 1;
      state.ball.angle = Math.PI - state.ball.angle;
    }
    if (state.ball.y < 0 || state.ball.y >= MAP_HEIGHT) {
      state.ball.angle = 2 * Math.PI - state.ball.angle;
    }
    state.updatedAt = ctx.time();
  }
}
