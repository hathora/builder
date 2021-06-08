import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Card, Color } from "../.rtag/types";
import { RtagClient } from "../.rtag/client";

export default class CardComponent extends LitElement {
  @property() val!: Card;
  @property() client!: RtagClient;

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
      @click="${async () => {
        const res = await this.client.playCard({ card: this.val });
        if (res !== undefined) {
          this.dispatchEvent(new CustomEvent("error", { detail: res }));
        }
      }}"
    >
      ${this.val.value}
    </div>`;
  }
}
