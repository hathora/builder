import os from "os";

import * as tsNode from "ts-node/esm";
import * as hotEsm from "hot-esm";

export default {
  loaders: os.platform() !== "win32" ? [hotEsm, tsNode] : [tsNode],
};
