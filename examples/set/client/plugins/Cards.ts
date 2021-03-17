import { Card, Color, Shading } from "../.rtag/types";
import { LitElement, html, property, css } from "lit-element";

export default class Cards extends LitElement {
  @property() val!: Card[];

  render() {
    console.log(this.val);

    return html`
      <div>
        <ul style="background: white">
          ${this.cards()}
        <ul/>
      </div>
      `;
  }

  cards() {
    return this.val.map((card, i) => {
      return html` <li>${i} : ${this.card(card)}</li> `;
    });
  }

  card(card: Card) {
    // color + count determine style

    // count + shape determine contents

    let baseSymbol = this.baseSymbol(card);
    let repeated = this.count(baseSymbol, card);

    return html`<b class="${card.color}${card.shading}"> ${repeated} </b>`;
  }

  baseSymbol(card: Card) {
    if (`${card.shape}` == "SQUIGGLE") {
      return "S";
    }
    if (`${card.shape}` == "OVAL") {
      return "⬬";
    }
    if (`${card.shape}` == "DIAMOND") {
      return "◆";
    }

    return "";
  }

  count(baseSymbol: string, card: Card) {
    if (`${card.count}` == "ONE") {
      return baseSymbol;
    }
    if (`${card.count}` == "TWO") {
      return baseSymbol.repeat(2);
    }
    if (`${card.count}` == "THREE") {
      return baseSymbol.repeat(3);
    }
  }

  static get styles() {
    return css`
      .REDEMPTY {
        -webkit-text-stroke-width: 3px;
        -webkit-text-stroke-color: red;
        -webkit-text-fill-color: rgba(0, 0, 0, 0);
      }
      .REDPARTIAL {
        background: -webkit-linear-gradient(
          red,
          white,
          red,
          white,
          red,
          white,
          red,
          white,
          red,
          white,
          red,
          white,
          red,
          white,
          red,
          white,
          red,
          white
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .REDFULL {
        color: red;
      }
      .GREENEMPTY {
        -webkit-text-stroke-width: 3px;
        -webkit-text-stroke-color: green;
        -webkit-text-fill-color: rgba(0, 0, 0, 0);
      }
      .GREENPARTIAL {
        background: -webkit-linear-gradient(
          green,
          white,
          green,
          white,
          green,
          white,
          green,
          white,
          green,
          white,
          green,
          white,
          green,
          white,
          green,
          white,
          green,
          white
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .GREENFULL {
        color: green;
      }
      .PURPLEEMPTY {
        -webkit-text-stroke-width: 3px;
        -webkit-text-stroke-color: purple;
        -webkit-text-fill-color: rgba(0, 0, 0, 0);
      }
      .PURPLEPARTIAL {
        background: -webkit-linear-gradient(
          purple,
          white,
          purple,
          white,
          purple,
          white,
          purple,
          white,
          purple,
          white,
          purple,
          white,
          purple,
          white,
          purple,
          white,
          purple,
          white
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .PURPLEFULL {
        color: purple;
      }
    `;
  }
}
