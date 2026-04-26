// mixins/anonymousMode.js
import { useSettingsStore } from "../pinia/settings";

export default {
  beforeRouteEnter(to, from, next) {
    // Retrieve the value of anonymousMode from localStorage
    const anonymousModeValue = localStorage.getItem("anonymousMode");
    if (anonymousModeValue !== null) {
      next((vm) => {
        const anonymousMode = anonymousModeValue === "true";
        const settingsStore = useSettingsStore();
        settingsStore.setAnonymousMode(anonymousMode);
      });
    } else {
      next();
    }
  },
};
