import { Reader, Writer } from "./serde";
import { DeepPartial, NO_DIFF, PlayerState } from "./types";

// const bits = [true, true, true, true, true, true, true, true, false];
// const writer = new Writer();
// writer.writeBits(bits);
// const buf = writer.toBuffer();
// const reader = new Reader(buf);
// console.log(buf, bits, reader.readBits(bits.length));

const diff: DeepPartial<PlayerState> = {
  playerA: NO_DIFF,
  playerB: { paddle: 190, score: NO_DIFF },
  ball: { x: 301.89419393862073, y: 175.07186269849083 },
};
console.log(diff);
const writer = new Writer();
PlayerState.encodeDiff(diff, writer);
const buf = writer.toBuffer();
console.log(buf);
console.log(PlayerState.decodeDiff(buf));
