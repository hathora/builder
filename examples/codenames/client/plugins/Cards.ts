import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Card, Cards, Color } from "../.hathora/types";
import { RtagConnection } from "../.hathora/client";

const DISPLAY_COLORS = {
  [Color.RED]: "#c55f5f",
  [Color.BLUE]: "#5a7ab6",
  [Color.BLACK]: "#292a2d",
  [Color.YELLOW]: "#c9a46e",
};
const REVEALED_COLORS = {
  [Color.RED]: "#c78686",
  [Color.BLUE]: "#768db7",
  [Color.BLACK]: "#5a5b62",
  [Color.YELLOW]: "#c9b394",
};

export default class CardsComponent extends LitElement {
  @property() val!: Cards;
  @property() client!: RtagConnection;

  render() {
    return html`<div class="grid-container">${this.val.map((card) => this.renderCard(card))}</div>`;
  }

  renderCard(card: Card) {
    const cardColor = card.color !== undefined ? DISPLAY_COLORS[card.color] : "#e1e4ec";
    const revealedCardColor = card.color !== undefined ? REVEALED_COLORS[card.color] : "#e1e4ec";
    return html`<div
      class="grid-item"
      style=${styleMap({
        outline: "3px solid " + (card.selectedBy !== undefined ? DISPLAY_COLORS[card.selectedBy] : cardColor),
        backgroundColor: card.selectedBy !== undefined ? revealedCardColor : cardColor,
        color: card.color !== undefined && Color[card.color] === "BLACK" ? "#cbd4e3" : "#20262f",
      })}
      @click="${async () => {
        const res = await this.client.selectCard({ word: card.word });
        if (res.type === "error") {
          this.dispatchEvent(new CustomEvent("error", { detail: res.error }));
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
        max-width: 675px;
      }
      .grid-item {
        margin: 10px;
        font-weight: 900;
        width: 115px;
        height: 65px;
        line-height: 65px;
        text-align: center;
        cursor: pointer;
        border-radius: 2px;
        box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
      }
      .grid-item:hover {
        box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
      }
    `;
  }
}
