import { Methods, Context } from "./.rtag/methods";
import { Response } from "./.rtag/base";
import { UserId, Direction, PlayerState, ICreateGameRequest, ISetDirectionRequest, Player, Point } from "./.rtag/types";

const MAP_WIDTH = 600;
const MAP_HEIGHT = 400;
const PADDLE_HEIGHT = 50;
const PADDLE_SPEED = 100;
const BALL_SPEED = 250;

type InternalState = {
  playerA: { id: string; direction: Direction; paddle: number; score: number };
  playerB: { id?: string; direction: Direction; paddle: number; score: number };
  ball: { x: number; y: number; angle: number };
};

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      playerA: { id: userId, direction: Direction.NONE, paddle: MAP_HEIGHT / 2, score: 0 },
      playerB: { direction: Direction.NONE, paddle: MAP_HEIGHT / 2, score: 0 },
      ball: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, angle: ctx.rand() * 2 * Math.PI },
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
    return state;
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {
    movePaddle(state.playerA, PADDLE_SPEED * timeDelta);
    movePaddle(state.playerB, PADDLE_SPEED * timeDelta);
    if (state.playerB.id === undefined) {
      return;
    }
    state.ball.x += Math.cos(state.ball.angle) * BALL_SPEED * timeDelta;
    state.ball.y += Math.sin(state.ball.angle) * BALL_SPEED * timeDelta;
    if (state.ball.x < 0) {
      if (!verticallyIntersects(state.ball, state.playerA)) {
        state.playerB.score++;
      }
      state.ball.x = 0;
      state.ball.angle = Math.PI - state.ball.angle;
    }
    if (state.ball.x >= MAP_WIDTH) {
      if (!verticallyIntersects(state.ball, state.playerB)) {
        state.playerA.score++;
      }
      state.ball.x = MAP_WIDTH - 1;
      state.ball.angle = Math.PI - state.ball.angle;
    }
    if (state.ball.y < 0 || state.ball.y >= MAP_HEIGHT) {
      state.ball.angle = 2 * Math.PI - state.ball.angle;
    }
  }
}

function movePaddle(player: { direction: Direction; paddle: number }, speed: number) {
  player.paddle += speed * (player.direction === Direction.NONE ? 0 : player.direction === Direction.UP ? -1 : 1);
}

function verticallyIntersects(ball: Point, player: Player) {
  return ball.y >= player.paddle - PADDLE_HEIGHT / 2 && ball.y <= player.paddle + PADDLE_HEIGHT / 2;
}
