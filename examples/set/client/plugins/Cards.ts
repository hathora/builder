import { Card } from "../.rtag/types";
import { LitElement, html, property } from "lit-element";

export default class Cards extends LitElement {
    @property() val!: Card[];

    render() {
        console.log(this.val);

        return html`
      <div>
        <ul>
          ${this.cards()}
        <ul/>
      </div>
      `;
    }

    cards() {

        return this.val.map(card => {
            return html`
                <li>
                  <p> ${card.color}, ${card.count}, ${card.shading}, ${card.shape} </p>
                </li>
            `
        })
    }
}