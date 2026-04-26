// mixins/darkMode.js
export default {
  beforeRouteEnter(to, from, next) {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode !== null) {
      // Set the dark mode preference from local storage
      next((vm) => {
        vm.$q.dark.set(darkMode === "true");
      });
    } else {
      // Default behavior (enable dark mode by default)
      next();
    }
  },
};
