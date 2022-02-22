# Client

The hathora framework includes an automatically generated [prototype UI](type-driven-development.md?id=prototype-ui) that lets you interact with your application and test your backend logic without writing any frontend code. Furthermore, hathora provides ways to incrementally add custom presentation logic as you become ready for it.

## Plugins

Plugins allow you to customize the way the prototype UI renders types in its state view. Plugins simply need to export a webcomponent, and can be created as follows for the following frontend frameworks:

- No framework: `hathora create-plugin-native <type>`
- React: `hathora create-plugin-react <type>`
- Lit: `hathora create-plugin-view <type>`

For example, you can create a plugin for type `Foo` using React by running `hathora create-plugin-react Foo`. This will cause the debug app to render your plugin's component anywhere `Foo` shows up in the state tree (instead of the rendering the default json view).

Plugins receive the following properties as input:

- val -- this is the value you are rendering, it has the type of your filename
- state -- this is the entire state tree, it has the type of `userState`
- client -- this is the hathora client instance (so you can make method calls from within your plugin), with type `HathoraClient`

Example (from uno, using Lit):

```js
// Card.ts

import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Card, Color } from "../.hathora/types";
import { HathoraConnection } from "../.hathora/client";

export default class CardComponent extends LitElement {
  @property() val!: Card;
  @property() client!: HathoraConnection;

  render() {
    return html`<div
      style=${styleMap({
        width: "50px",
        height: "75px",
        lineHeight: "75px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: Color[this.val.color].toLowerCase(),
      })}
      @click="${() => this.client.playCard({ card: this.val })}"
    >
      ${this.val.value}
    </div>`;
  }
}
```

Which renders like this in the prototype UI:
![image](https://user-images.githubusercontent.com/5400947/149680633-b165e6d7-8c87-417a-88e8-9cc1fd14b80d.png)

## Fully custom frontend

When you're ready to move away from the debug app, simply create a new folder (you can name it anything you want) inside the `client` directory with an `index.html` file inside. This file now serves as the entry point to your frontend at http://localhost:3001, and can load code and other resources as needed. You are free to use any technologies you wish to build your frontend, just make sure to import the generated client to communicate with the hathora server.

The `hathora` frontend tooling is built around [vite](https://vitejs.dev/), which generally creates for a pleasant development experience.

For an example of a fully custom frotend built using hathora and PIXI.js, see https://github.com/hathora/ship-battle.

For an example using React, see https://github.com/hpx7/tussie-mussie.
