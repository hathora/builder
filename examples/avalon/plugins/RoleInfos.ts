import { LitElement, html, css, property } from "lit-element";
import { Role, RoleInfo } from "../.rtag/types";

export default class RoleInfos extends LitElement {
  @property() val!: RoleInfo[];
  @property() isOpen: boolean = true;

  render() {
    return html`
      <span>
        <button
          class="button small"
          type="button"
          @click="${() => {
            this.isOpen = !this.isOpen;
          }}"
        >
          ${this.isOpen ? html`<span class="button-text">-</span>` : html`<span class="button-text">+</span>`}
        </button>
        ${this.isOpen
          ? html`<table style="color: white">
              <tr>
                <th>Role</th>
                <th>Is Evil?</th>
                <th>Known Roles</th>
                <th>Quantity</th>
              </tr>
              ${this.filterRoleInfos().map(
                (v) => html`<tr>
                  <td>${this.roleToString(v.role)}</td>
                  <td>${v.isEvil}</td>
                  <td>${this.formatKnownRoles(v.knownRoles, this.filterRoleInfos())}</td>
                  <td>${v.quantity}</td>
                </tr>`
              )}
            </table>`
          : html`<span>...</span>`}
      </span>
    `;
  }
  roleToString(r: Role) {
    return Role[r].toLowerCase().replace(/^[a-z]/, (x) => x.toUpperCase());
  }
  filterRoleInfos() {
    const filtered = this.val.filter((r) => r.quantity > 0);
    return filtered.length > 0 ? filtered : this.val;
  }
  formatKnownRoles(knownRoles: Role[], roleInfosInGame: RoleInfo[]) {
    const rolesInGame = roleInfosInGame.map((i) => i.role);
    return knownRoles
      .filter((r) => rolesInGame.includes(r))
      .map(this.roleToString)
      .join(", ");
  }
}
