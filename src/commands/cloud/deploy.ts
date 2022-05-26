import { CommandModule } from "yargs";
import tar from "tar";
import FormData from "form-data";

import { getDirs, makeCloudApiRequest} from "../../utils";

const cmd: CommandModule = {
  command: "deploy",
  aliases: ["d"],
  describe: "Deploys application to Hathora Cloud",
  builder: {
    appName: { type: "string", demandOption: true },
    token: { type: "string", demandOption: true, hidden: true },
    cloudApiBase: { type: "string", demandOption: true, hidden: true },
  },
  async handler(argv) {
    const { rootDir } = getDirs();
    const tarFile = tar.create(
      {
        cwd: rootDir,
        gzip: true,
        filter: (path) =>
          !path.startsWith("./api") &&
          !path.startsWith("./data") &&
          !path.includes(".hathora") &&
          !path.includes("node_modules"),
      },
      ["."]
    );
    const form = new FormData();
    form.append("appName", argv.appName);
    form.append("file", tarFile, "bundle.tar.gz");
    await makeCloudApiRequest(argv.cloudApiBase as string, "/deploy", argv.token as string, "POST", form);
  },
};

module.exports = cmd;
