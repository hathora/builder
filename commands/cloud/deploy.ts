import { CommandModule } from "yargs";
import tar from "tar";
import FormData from "form-data";
import { getDirs } from "../../utils";
import axios from "axios";
import { Stream } from "stream";

const cmd: CommandModule = {
  command: "deploy",
  aliases: ["d"],
  describe: "Deploys application to Hathora Cloud",
  builder: {
    appName: { type: "string", demandOption: true },
    token: { type: "string", demandOption: true, hidden: true },
    cloudApiBase: { type: "string", demandOption: true, hidden: true },
  },
  handler: async (argv) => {
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
    const headers = { Authorization: `Bearer ${argv.token}` };
    try {
      const response = await axios.postForm(`${argv.cloudApiBase}/deploy`, form, { headers, responseType: "stream" });
      response.data.pipe(process.stdout);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        (err.response?.data as Stream).on("data", (data) => console.log(data.toString()));
      }
    }
  },
};

module.exports = cmd;
