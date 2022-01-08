import "@fontsource/patua-one";
import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Card, Color } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";

let DISPLAY_COLORS: {[index: string]:string} = {
  RED: '#e16c6c',
  BLUE: '#6c91d9',
  GREEN: '#70bd56',
  YELLOW: '#fcda49',
}

export default class CardComponent extends LitElement {
  @property() val!: Card;
  @property() client!: RtagConnection;

  static get styles() {
    return css`
      .game-main {
        font-family: "Patua One", sans-serif;
      }
    `;
  }

  render() {
    return html`<div
      class="game-main"
      style=${styleMap({
        width: "50px",
        height: "75px",
        lineHeight: "75px",
        textAlign: "center",
        cursor: "pointer",
        borderRadius: "1px 6px 1px 6px",
        border: "2px solid white",
        outline: "1px solid black",
        fontSize: "2rem",
        color: "white",
        textShadow: "1px 2px #000000",
        boxShadow: "2px 2px 0px 0px black",
        backgroundColor: DISPLAY_COLORS[Color[this.val.color]],
      })}
      @click="${async () => {
        const res = await this.client.playCard({ card: this.val });
        if (res.type === "error") {
          this.dispatchEvent(new CustomEvent("error", { detail: res.error }));
        }
      }}"
    >
      ${this.val.value}
    </div>`;
  }
}
