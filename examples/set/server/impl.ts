import { Methods } from "./.rtag/methods";
import {
  UserData,
  PlayerState,
  ICreateGameRequest,
  Card,
  Color,
  Shading,
  Shape,
  Count,
  AnonymousUserData,
  ISubmitSetRequest,
  IRequestHelpRequest,
} from "./.rtag/types";

interface InternalState {
  deck: Card[];
  board: Card[];
}

export class Impl implements Methods<InternalState> {
  createGame(user: UserData, request: ICreateGameRequest): InternalState {
    const initialDeck = shuffle(allCards());
    let initialBoard: Card[] = [];

    for (let _ in [...Array(12).keys()]) {
      let topCard = initialDeck.pop();
      if (topCard) {
        initialBoard.push(topCard);
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
  submitSet(state: InternalState, user: AnonymousUserData, request: ISubmitSetRequest): string | void {
    const card1 = state.board[request.card1];
    const card2 = state.board[request.card2];
    const card3 = state.board[request.card3];

    if (card1 == card2 || card1 == card3 || card2 == card3) {
      return "Three cards must be distinct";
    }

    if (!card1 || !card2 || !card3) {
      return "At least one card was invalid";
    }

    if (isSet(card1, card2, card3)) {
      console.log("Found a set!");
      // TODO: increment score
      const newCard1 = state.deck.pop();
      const newCard2 = state.deck.pop();
      const newCard3 = state.deck.pop();

      if (newCard1 && newCard2 && newCard3) {
        state.board[request.card1] = newCard1;
        state.board[request.card2] = newCard2;
        state.board[request.card3] = newCard3;
      } else {
        // no cards left in deck. just remove the cards
        let sortedCards = [request.card1, request.card2, request.card3].sort();
        state.board.splice(sortedCards[2], 1);
        state.board.splice(sortedCards[1], 1);
        state.board.splice(sortedCards[0], 1);
      }

      return "Set found! Well done";
    }
    return "Not a set, try harder next time";
  }
  requestHelp(state: InternalState, user: AnonymousUserData, request: IRequestHelpRequest): string | void {
    for (let i in [...Array(state.board.length).keys()]) {
      for (let j in [...Array(state.board.length).keys()]) {
        if (j <= i) {
          continue;
        }
        for (let k in [...Array(state.board.length).keys()]) {
          if (k <= j) {
            continue;
          }

          let card1 = state.board[i];
          let card2 = state.board[j];
          let card3 = state.board[k];

          if (isSet(card1, card2, card3)) {
            return `Here's a set: ${i}, ${j}, ${k}`;
          }
        }
      }
    }
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
            color: (color as any) as Color,
            shading: (shading as any) as Shading,
            shape: (shape as any) as Shape,
            count: (count as any) as Count,
          });
        }
      }
    }
  }

  return result;
}

function isSet(card1: Card, card2: Card, card3: Card): boolean {
  if (
    !(card1.color == card2.color && card2.color == card3.color) &&
    !(card1.color !== card2.color && card1.color !== card3.color && card2.color !== card3.color)
  ) {
    console.log("Color check failed");
    return false;
  }

  if (
    !(card1.shading == card2.shading && card2.shading == card3.shading) &&
    !(card1.shading !== card2.shading && card1.shading !== card3.shading && card2.shading !== card3.shading)
  ) {
    console.log("shading check failed");
    return false;
  }

  if (
    !(card1.count == card2.count && card2.count == card3.count) &&
    !(card1.count !== card2.count && card1.count !== card3.count && card2.count !== card3.count)
  ) {
    console.log("count check failed");
    return false;
  }

  if (
    !(card1.shape == card2.shape && card2.shape == card3.shape) &&
    !(card1.shape !== card2.shape && card1.shape !== card3.shape && card2.shape !== card3.shape)
  ) {
    console.log("shape check failed");
    return false;
  }

  return true;
}

export function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
