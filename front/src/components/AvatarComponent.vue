<template>
  <q-avatar v-if="displayImage" size="xl">
    <img :src="resolvedImageUrl" alt="User Avatar" @error="useFallbackImage" />
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
const FALLBACK_AVATAR = "/img/unknown-avatar.png";

export default {
  props: {
    displayImage: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: FALLBACK_AVATAR,
    },
  },
  data() {
    return {
      currentImageUrl: this.imageUrl || FALLBACK_AVATAR,
    };
  },
  computed: {
    resolvedImageUrl() {
      return this.currentImageUrl || FALLBACK_AVATAR;
    },
  },
  watch: {
    imageUrl: {
      immediate: true,
      handler(value) {
        this.currentImageUrl = value || FALLBACK_AVATAR;
      },
    },
  },
  methods: {
    useFallbackImage() {
      this.currentImageUrl = FALLBACK_AVATAR;
    },
  },
};
</script>
