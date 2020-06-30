// export const PlayerNameArrayDisplayComponent = `<span><div v-for="v in value"><slot :value="v"></slot></div></span>`;
export const PlayerNameArrayDisplayComponent = {
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
    <div v-else v-for="v in value">
      {{v + " this is mine"}}
    </div>
  </span>`,
};
