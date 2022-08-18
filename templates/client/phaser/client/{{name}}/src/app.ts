import Phaser from "phaser";

import { HathoraClient, HathoraConnection, StateId } from "../../.hathora/client";

const client = new HathoraClient();

export class GameScene extends Phaser.Scene {
  private connection!: HathoraConnection;

  constructor() {
    super("game");
  }

  preload() {}

  init() {
    getToken().then(async (token) => {
      const stateId = await getStateId(token);
      this.connection = await client.connect(
        token,
        stateId,
        ({ state, updatedAt }) => {
          console.log("State update", state, updatedAt);
        },
        (err) => console.error("Error occured", err.message)
      );
      await this.connection.joinGame({});
    });
  }

  create() {
    this.add.text(this.scale.width / 2, this.scale.height / 2, "Hello, World!").setOrigin(0.5);
  }

  update() {}
}

async function getToken(): Promise<string> {
  const storedToken = sessionStorage.getItem(client.appId);
  if (storedToken !== null) {
    return storedToken;
  }
  const token = await client.loginAnonymous();
  sessionStorage.setItem(client.appId, token);
  return token;
}

async function getStateId(token: string): Promise<StateId> {
  if (location.pathname.length > 1) {
    return location.pathname.split("/").pop()!;
  }
  const stateId = await client.create(token, {});
  history.pushState({}, "", `/${stateId}`);
  return stateId;
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  parent: "phaser-container",
});
