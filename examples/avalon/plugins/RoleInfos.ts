import { Vue, Component, Prop } from "vue-property-decorator";
import { Role, RoleInfo } from "../.rtag/types";
import wrap from "@vue/web-component-wrapper";

@Component({
  template: `
    <span>
      <button class="button small" type="button" v-on:click="isOpen=!isOpen">
        <span class="button-text" v-if="isOpen">-</span>
        <span class="button-text" v-else>+</span>
      </button>
      <span v-if="!isOpen">...</span>
      <table style="color: white" v-else>
        <tr>
          <th>Role</th>
          <th>Is Evil?</th>
          <th>Known Roles</th>
          <th>Quantity</th>
        </tr>
        <tr v-for="v in filterRoleInfos()">
          <td>{{ roleToString(v.role) }}</td>
          <td>{{ v.isEvil }}</td>
          <td>{{ formatKnownRoles(v.knownRoles, filterRoleInfos()) }}</td>
          <td>{{ v.quantity }}</td>
        </tr>
      </table>
    </span>
  `,
})
class RoleInfos extends Vue {
  @Prop() val!: RoleInfo[];
  isOpen: boolean = true;
  roleToString(r: Role) {
    return Role[r].toLowerCase().replace(/^[a-z]/, (x) => x.toUpperCase());
  }
  formatKnownRoles(knownRoles: Role[], roleInfosInGame: RoleInfo[]) {
    const rolesInGame = roleInfosInGame.map((i) => i.role);
    return knownRoles.filter((r) => rolesInGame.includes(r)).map(this.roleToString);
  }
  filterRoleInfos() {
    const filtered = this.val.filter((r) => r.quantity > 0);
    return filtered.length > 0 ? filtered : this.val;
  }
}

export default wrap(Vue, RoleInfos);
