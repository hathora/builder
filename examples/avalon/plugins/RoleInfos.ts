import Vue from "vue";
import { Role, RoleInfo } from "../.lsot/types";

export default Vue.extend({
  data: function () {
    return {
      isOpen: true,
    };
  },
  props: { value: Array },
  template: `
  <span v-if="value && value.length > 0">
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
        <tr v-for="v in filterRoleInfos(value)">
            <td>{{roleToString(v.role)}}</td>
            <td>{{v.isEvil}}</td>
            <td>{{formatKnownRoles(v.knownRoles, filterRoleInfos(value))}}</td>
            <td>{{v.quantity}}</td>
        </tr>
    </table>
  </span>`,
  methods: {
    roleToString(r: Role) {
      return Role[r].toLowerCase().replace(/^[a-z]/, (x) => x.toUpperCase());
    },
    formatKnownRoles(knownRoles: Role[], roleInfosInGame: RoleInfo[]) {
      const rolesInGame = roleInfosInGame.map((i) => i.role);
      return knownRoles.filter((r) => rolesInGame.includes(r)).map(this.roleToString);
    },
    filterRoleInfos(roleInfos: RoleInfo[]) {
      const filtered = roleInfos.filter((r) => r.quantity > 0);
      return filtered.length > 0 ? filtered : roleInfos;
    },
  },
});
