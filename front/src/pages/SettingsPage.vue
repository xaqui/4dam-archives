<template>
  <q-page class="relative-position">
    <div class="q-px-lg full-height q-py-lg">
      <div class="row items-center justify-center q-col-gutter-md">
        <h4 class="q-mt-none q-mb-md text-weight-bold">Settings</h4>
      </div>
      <div class="row items-center justify-center q-col-gutter-md">
        <q-toggle v-model="darkMode" label="Dark Mode" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "SettingsPage",
  setup() {
    const $q = useQuasar();
    const darkMode = computed({
      get: () => $q.dark.isActive,
      set: () => {
        $q.dark.toggle();
        localStorage.setItem("darkMode", $q.dark.isActive.toString());
      },
    });

    return {
      darkMode,
    };
  },
});
</script>
