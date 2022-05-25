import { join } from "path";
import os from "os";

import { CommandModule } from "yargs";
import prompts from "prompts";
import { Issuer } from "openid-client";
import open from "open";
import { outputFileSync } from "fs-extra";
import chalk from "chalk";

const cmd: CommandModule = {
  command: "login",
  aliases: "l",
  describe: "Login to Hathora Cloud",
  async handler() {
    const auth0 = await Issuer.discover("https://auth.hathora.com");
    const client = new auth0.Client({
      client_id: "tWjDhuzPmuIWrI8R9s3yV3BQVw2tW0yq",
      token_endpoint_auth_method: "none",
      id_token_signed_response_alg: "RS256",
    });
    const handle = await client.deviceAuthorization({ scope: "openid email", audience: "https://cloud.hathora.com" });

    const userInput = await prompts({
      type: "confirm",
      name: "value",
      message: `Open browser for login? You should see the following code: ${handle.user_code}.`,
      initial: true,
    });

    if (!userInput.value) {
      return;
    }

    open(handle.verification_uri_complete);
    const tokens = await handle.poll();
    const tokenPath = join(os.homedir(), ".config", "hathora", "token");
    outputFileSync(tokenPath, tokens.access_token);
    console.log(chalk.green(`Successfully logged in! Saved credentials to ${tokenPath}`));
  },
};

module.exports = cmd;
