import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { PlayerState } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";

export default class CardsComponent extends LitElement {
  @property() val!: PlayerState;
  @property() client!: RtagConnection;

  render() {
    return html`<canvas width="600" height-"400"></canvas>`;
  }
}
