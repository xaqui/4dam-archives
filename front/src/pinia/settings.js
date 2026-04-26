import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    isAnonymousMode: false,
  }),
  getters: {
    getAnonymousMode: (state) => state.isAnonymousMode,
  },
  actions: {
    setAnonymousMode(value) {
      this.$state.isAnonymousMode = value;
    },
    toggleAnonymousMode() {
      this.$state.isAnonymousMode = !this.$state.isAnonymousMode;
    },
  },
});
