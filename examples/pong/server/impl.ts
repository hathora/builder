import { Methods, Context } from "./.rtag/methods";
import { UserData, Response } from "./.rtag/base";
import { Direction, PlayerState, ICreateGameRequest, IJoinGameRequest, ISetDirectionRequest } from "./.rtag/types";

const MAP_WIDTH = 600;
const MAP_HEIGHT = 400;
const PADDLE_SPEED = 100;
const BALL_SPEED = 250;

type InternalState = {
  playerA: { id: string; direction: Direction; paddle: number };
  playerB: { id?: string; direction: Direction; paddle: number };
  ball: { x: number; y: number; angle: number };
  updatedAt: number;
};

export class Impl implements Methods<InternalState> {
  createGame(user: UserData, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      playerA: {
        id: user.id,
        direction: Direction.NONE,
        paddle: MAP_HEIGHT / 2,
      },
      playerB: {
        direction: Direction.NONE,
        paddle: MAP_HEIGHT / 2,
      },
      ball: {
        x: MAP_WIDTH / 2,
        y: MAP_HEIGHT / 2,
        angle: ctx.rand() * Math.PI,
      },
      updatedAt: 0,
    };
  }
  joinGame(state: InternalState, user: UserData, ctx: Context, request: IJoinGameRequest): Response {
    if (state.playerA.id === user.id || state.playerB.id === user.id) {
      return Response.error("Already joined");
    }
    if (state.playerB.id !== undefined) {
      return Response.error("Already started");
    }
    state.playerB.id = user.id;
    return Response.ok();
  }
  setDirection(state: InternalState, user: UserData, ctx: Context, request: ISetDirectionRequest): Response {
    if (state.playerA.id === user.id) {
      state.playerA.direction = request.direction;
      return Response.ok();
    } else if (state.playerB.id === user.id) {
      state.playerB.direction = request.direction;
      return Response.ok();
    } else {
      return Response.error("Not in game");
    }
  }
  getUserState(state: InternalState, user: UserData): PlayerState {
    return {
      paddleA: state.playerA.paddle,
      paddleB: state.playerB.paddle,
      ball: state.ball,
      updatedAt: state.updatedAt,
    };
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {
    if (state.playerB.id === undefined) {
      return;
    }
    if (state.ball.x < 0 || state.ball.y < 0 || state.ball.x >= MAP_WIDTH || state.ball.y >= MAP_HEIGHT) {
      return;
    }
    if (state.playerA.direction !== Direction.NONE) {
      state.playerA.paddle += PADDLE_SPEED * timeDelta * (state.playerA.direction === Direction.DOWN ? 1 : -1);
    }
    if (state.playerB.direction !== Direction.NONE) {
      state.playerB.paddle += PADDLE_SPEED * timeDelta * (state.playerB.direction === Direction.DOWN ? 1 : -1);
    }
    state.ball.x += Math.cos(state.ball.angle) * BALL_SPEED * timeDelta;
    state.ball.y += Math.sin(state.ball.angle) * BALL_SPEED * timeDelta;
  }
}
