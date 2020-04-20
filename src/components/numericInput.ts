import { LitElement, html, customElement, property } from 'lit-element';
  
@customElement('numeric-input')
export class NumericInput extends LitElement {
  @property({type : Number})  value = 0;
  private privateValue: string = "0";
  
  render() {
    return html`<input type="number" value="${this.privateValue}" @change=${this.onChange}>`;
  }

  private onChange = (e: any) => {
      e.stopPropagation();
      const { value: targetValue } = e.target;
      this.value = new Number(targetValue).valueOf();
      this.privateValue = targetValue;
  }
}