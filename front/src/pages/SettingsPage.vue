<template>
  <q-page class="relative-position">
    <div class="q-px-lg full-height q-py-lg">
      <div class="row items-center justify-center q-col-gutter-md">
        <h4 class="q-mt-none q-mb-md text-weight-bold">Settings</h4>
      </div>
      <div class="row items-center justify-center q-col-gutter-md">
        <q-toggle v-model="anonymousMode" label="Post as Anonymous" />
        <q-toggle v-model="darkMode" label="Dark Mode" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, watch, onBeforeMount } from "vue";
import { useQuasar } from "quasar";
import { useSettingsStore } from "../pinia/settings";

let currentDarkMode;
export default defineComponent({
  name: "SettingsPage",
  setup() {
    const $q = useQuasar();
    const darkMode = computed({
      get: () => $q.dark.isActive,
      set: (value) => {
        $q.dark.toggle();
        localStorage.setItem("darkMode", $q.dark.isActive.toString());
      },
    });

    const store = useSettingsStore();
    const anonymousMode = computed({
      get: () => store.getAnonymousMode,
      set: (value) => {
        store.toggleAnonymousMode();
        localStorage.setItem("anonymousMode", value.toString());
      },
    });

    onBeforeMount(() => {
      // Initialize the values based on localStorage
      // This feels very hacky
      store.setAnonymousMode(localStorage.getItem("anonymousMode") === "true");
    });
    return {
      anonymousMode,
      darkMode,
    };
  },
});
</script>
