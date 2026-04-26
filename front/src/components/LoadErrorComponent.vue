<template>
  <div class="q-py-xl q-px-md row justify-center">
    <div class="text-center">
      <h5 class="q-my-none">{{ message }}</h5>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: "Oops! Something went wrong. Please refresh the page and try again.",
    },
  },
};
</script>
