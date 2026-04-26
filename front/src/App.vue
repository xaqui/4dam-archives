<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "App",
  created() {
    // Check local storage and set dark mode preference
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode !== null) {
      this.$q.dark.set(darkMode === "true");
    }
  },
});
</script>
