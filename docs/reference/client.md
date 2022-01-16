# Client

The hathora framework includes an automatically generated debug application that lets you interact with your application and test your backend logic without writing any frontend code. Furthermore, hathora provides ways to incrementally add custom presentation logic as you become ready for it.

## Plugins

Plugins go inside the `client/plugins` directory. To create a plugin for type `Foo`, create a file named `Foo.ts` and rerun the `hathora` command. This will cause the debug app to render your plugin's component anywhere `Foo` shows up in the state tree (instead of the rendering the default json view).

Your plugin must export a webcomponent (a class that extends `HTMLElement`). While you are free to write a native webcomponent without any dependencies, most popular frontend libraries have ways to create webcomponents. Some examples include:

- React (via https://github.com/bitovi/react-to-webcomponent)
- Vue (via https://github.com/vuejs/vue-web-component-wrapper)
- Lit (no wrapper required)

Plugins receive the following props as input:

- val -- this is the value you are rendering, it has the type of your filename
- state -- this is the entire state tree, it has the type of `userState`
- client -- this is the hathora client instance (so you can make method calls from within your plugin), with type `RtagClient`

Example (from uno, using Lit):

```js
// Card.ts

import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Card, Color } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";

export default class CardComponent extends LitElement {
  @property() val!: Card;
  @property() client!: RtagConnection;

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

Which renders like this in the debug application:
![image](https://user-images.githubusercontent.com/5400947/134374863-612fb496-bb48-40c9-bbdc-ed4257565aea.png)

## Fully custom frontend

When you're ready to move away from the debug app, simply create an `index.html` file at the root of the `client` directory. This file now serves as the entry point to your frontend at http://localhost:4000, and can load code and other resources as needed. You are free to use any technologies you wish to build your frontend, just make sure to import the generated client to communicate with the hathora server.

The `hathora` frontend tooling is built around [vite](https://vitejs.dev/), which generally creates for a pleasant development experience.

For an example of a fully custom frotend built using hathora, see https://github.com/knigam/hive.
