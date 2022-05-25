import path, { join } from "path";
import os from "os";
import { existsSync } from "fs";

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
    const tokenPath = join(os.homedir(), ".config", "hathora", "token");
    if (existsSync(tokenPath)) {
      console.log(chalk.red(`Token file already present at ${tokenPath}. If you'd like to get a new one, please remove this file.`));
      return;
    }

    const auth0 = await Issuer.discover("https://auth.hathora.com");
    const client = new auth0.Client({
      client_id: "tWjDhuzPmuIWrI8R9s3yV3BQVw2tW0yq",
      token_endpoint_auth_method: "none",
      id_token_signed_response_alg: "RS256",
      grant_type: "refresh_token"
    });
    const handle = await client.deviceAuthorization({ scope: "openid email offline_access", audience: "https://cloud.hathora.com" });

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
    outputFileSync(tokenPath, tokens.refresh_token);
    console.log(chalk.green(`Successfully logged in! Saved credentials to ${tokenPath}`));
  },
};

module.exports = cmd;
