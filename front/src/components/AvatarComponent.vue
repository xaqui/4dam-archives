<template>
  <q-avatar v-if="displayImage" size="xl">
    <img v-if="imageUrl" :src="imageUrl" alt="User Avatar" />
    <img v-else src="/img/unknown-avatar.png" alt="User Avatar" />
  </q-avatar>
  <q-avatar v-else size="xl">
    <div class="icon-container">
      <i class="fa-solid fa-user-secret" id="anon-icon" />
      <svg width="64" height="64" id="anon-bg">
        <rect width="64" height="64" />
      </svg>
    </div>
  </q-avatar>
</template>

<style lang="scss">
.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 64px;
  height: 64px;
}

#anon-icon {
  position: absolute;
  z-index: 1;
  transform: translateY(-35%);
}

.body--dark #anon-icon {
  color: $grey-2;
}
.body--light #anon-icon {
  color: $grey-9;
}

#anon-bg {
  position: absolute;
  z-index: 0;
}

.body--light #anon-bg {
  fill: $grey-2;
}
.body--dark #anon-bg {
  fill: $grey-9;
}
</style>

<script>
export default {
  props: {
    displayImage: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: "/img/unknown-avatar.png",
    },
  },
};
</script>
