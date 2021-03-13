import { Methods } from "./.rtag/methods";
import {
  UserData,
  PlayerState,
  ICreateGameRequest,
  Card,
  Color,
  Shading, Shape, Count
} from "./.rtag/types";

interface InternalState {
  deck: Card[],
  board: Card[]
}

export class Impl implements Methods<InternalState> {
  createGame(user: UserData, request: ICreateGameRequest): InternalState {

    const initialDeck = shuffle(allCards());
    let initialBoard: Card[] = [];

    for (let _ in [...Array(12).keys()]) {
      let topCard = initialDeck.pop();
      if (topCard) {
        initialDeck.push(topCard);
      }
    }

    return {
      deck: initialDeck,
      board: initialBoard,
    };
  }
  getUserState(state: InternalState, user: UserData): PlayerState {
    return {
      deckSize: state.deck.length,
      board: state.board,
      score: 0,
    };
  }
}

function allCards(): Card[] {
  let result: Card[] = [];

  for (const color in Color) {
    if (!isNaN(Number(color))) {
      continue;
    }
    for (const shading in Shading) {
      if (!isNaN(Number(shading))) {
        continue;
      }
      for (const shape in Shape) {
        if (!isNaN(Number(shape))) {
          continue;
        }
        for (const count in Count) {
          if (!isNaN(Number(count))) {
            continue;
          }
          result.push({
            color: color as any as Color,
            shading: shading as any as Shading,
            shape: shape as any as Shape,
            count: count as any as Count,
          });
        }
      }
    }
  }

  console.log(result);

  return result;
}

export function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}