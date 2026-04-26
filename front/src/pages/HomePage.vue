<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <load-error-component v-if="loadError" :message="loadError" />
      <div v-else>
        <q-list separator>
          <transition-group
            appear
            enter-active-class="animated fadeIn slower"
            leave-active-class="animated fadeOut slower"
          >
            <post-item
              v-for="post in visiblePosts"
              :key="post.id"
              :post="post"
            />
          </transition-group>
          <q-item v-if="!loading && visiblePosts.length < posts.length" class="row justify-center">
            <q-btn
              @click="loadMore"
              outline
              rounded
              color="primary"
              label="Load More"
            />
          </q-item>
        </q-list>
        <q-item v-if="loading" class="row justify-center q-py-xl">
          <q-spinner color="primary" size="2em" />
        </q-item>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import PostItem from "../components/PostItem.vue";
import LoadErrorComponent from "../components/LoadErrorComponent.vue";
import { getTimelinePosts } from "../services/archive";

export default defineComponent({
  name: "HomePage",
  components: {
    LoadErrorComponent,
    PostItem,
  },
  data() {
    return {
      posts: [],
      postsDisplayAmount: 10,
      loading: true,
      loadError: "",
    };
  },
  computed: {
    visiblePosts() {
      return this.posts.slice(0, this.postsDisplayAmount);
    },
  },
  async created() {
    await this.loadPosts();
  },
  methods: {
    async loadPosts() {
      this.loading = true;
      this.loadError = "";

      try {
        this.posts = await getTimelinePosts();
      } catch (error) {
        console.error(error);
        this.loadError = "Unable to load the archive timeline.";
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      this.postsDisplayAmount += 10;
    },
  },
});
</script>
