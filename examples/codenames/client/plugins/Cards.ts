import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Card, Cards, Color } from "../.rtag/types";
import { RtagClient } from "../.rtag/client";

export default class CardsComponent extends LitElement {
  @property() val!: Cards;
  @property() client!: RtagClient;

  render() {
    return html`<div class="grid-container">${this.val.map((card) => this.renderCard(card))}</div>`;
  }

  renderCard(card: Card) {
    const cardColor = card.color !== undefined ? Color[card.color].toLowerCase() : "grey";
    return html`<div
      class="grid-item"
      style=${styleMap({
        outline: "3px solid " + (card.selectedBy !== undefined ? Color[card.selectedBy].toLowerCase() : cardColor),
        border: "5px solid " + (card.selectedBy !== undefined ? "black" : cardColor),
        backgroundColor: cardColor,
      })}
      @click="${async () => {
        const res = await this.client.selectCard({ word: card.word });
        if (res !== undefined) {
          this.dispatchEvent(new CustomEvent("error", { detail: res }));
        }
      }}"
    >
      ${card.word}
    </div>`;
  }

  static get styles() {
    return css`
      .grid-container {
        display: grid;
        grid-template-columns: auto auto auto auto auto;
      }
      .grid-item {
        margin: 10px;
        font-weight: 900;
        width: 115px;
        height: 65px;
        lineheight: 75px;
        textalign: center;
        cursor: pointer;
      }
    `;
  }
}
