import * as tsNode from "ts-node/esm";
import * as hotEsm from "hot-esm";

export default {
  loaders: [hotEsm, tsNode],
};
