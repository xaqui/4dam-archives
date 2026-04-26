<template>
  <q-item class="post q-py-md">
    <q-item-section class="q-px-md q-pt-sm">
      <div class="row">
        <q-item-section avatar>
          <avatar-component
            :displayImage="post.show_name"
            :imageUrl="post.author_snapshot && post.author_snapshot.avatar"
          />
        </q-item-section>
        <q-item-label class="text-subtitle1 post-meta q-py-sm col">
          <span class="text-grey-7">{{ displayName }}</span>
          <span class="q-px-sm">&bull;</span>
          <span class="q-px-xs date">{{ formatRelativeDate(post.date) }}</span>
          <span class="q-px-sm">&bull;</span>
          <span class="q-px-xs date">{{ formatExactDate(post.date) }}</span>
        </q-item-label>
      </div>

      <q-item-label class="post-content text-body1 q-py-md q-px-md">
        {{ post.content }}
      </q-item-label>
      <div class="post-image row flex-center q-py-sm q-px-md">
        <q-img
          v-if="resolvedMediaUrl"
          :src="resolvedMediaUrl"
          loading="lazy"
          spinner-color="white"
          width="595px"
          height="595px"
          fit="contain"
          class="rounded-borders archive-image"
          @error="useFallbackImage"
        />
      </div>
      <div class="post-icons row justify-center q-mt-sm q-mx-md">
        <div class="justify-between flex-center text-grey-7">
          <q-icon name="fa-solid fa-heart" size="sm" />
          <span class="col self-center q-px-sm">{{ post.points }}</span>
        </div>
      </div>
    </q-item-section>

    <q-item-section side top></q-item-section>
  </q-item>
</template>

<script>
import { format, formatDistance } from "date-fns";
import AvatarComponent from "../components/AvatarComponent.vue";

const FALLBACK_POST_IMAGE = "img/default-placeholder.png";

export default {
  components: {
    AvatarComponent,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mediaUrl: this.post.media_url,
    };
  },
  computed: {
    displayName() {
      if (!this.post.show_name || !this.post.author_snapshot) {
        return "Anonymous";
      }

      return (
        this.post.author_snapshot.nick ||
        this.post.author_snapshot.displayName ||
        this.post.author_snapshot.uid
      );
    },
    resolvedMediaUrl() {
      return this.mediaUrl || null;
    },
  },
  watch: {
    "post.media_url": {
      immediate: true,
      handler(value) {
        this.mediaUrl = value || null;
      },
    },
  },
  methods: {
    useFallbackImage() {
      if (this.mediaUrl !== FALLBACK_POST_IMAGE) {
        this.mediaUrl = FALLBACK_POST_IMAGE;
      }
    },
    formatRelativeDate(value) {
      return formatDistance(value, Date.now());
    },
    formatExactDate(value) {
      return format(value, "dd/MM/yyyy (EEEE) @ HH:mm");
    },
  },
};
</script>

<style soped lang="scss">
.post-meta {
  font-size: 0.9rem;
}

.post-meta .date {
  font-size: 0.8rem;
}

.post-content {
  white-space: pre-line;
}

.post-icons {
  margin-left: -5px;
}

.archive-image {
  max-width: 100%;
  background: rgba(0, 0, 0, 0.04);
}

@media screen and (max-width: 600px) {
  .archive-image {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1 / 1;
  }
}

.post:not(:first-child) {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
