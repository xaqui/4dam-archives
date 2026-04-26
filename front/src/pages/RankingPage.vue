<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <load-error-component v-if="loadError" :message="loadError" />
      <div v-else>
        <div class="row justify-center q-py-md header">
          <q-btn
            @click="loadBestPosts"
            flat
            round
            :color="show_best ? 'yellow-8' : 'grey-8'"
            icon="fa-solid fa-crown"
          />
          <span class="q-px-md"></span>
          <q-btn
            @click="loadWorstPosts"
            flat
            round
            :color="!show_best ? 'brown-8' : 'grey-8'"
            icon="fa-solid fa-poop"
          />
        </div>
        <q-list separator>
          <transition-group
            appear
            enter-active-class="animated fadeIn slower"
            leave-active-class="animated fadeOut slower"
          >
            <post-item v-for="post in posts" :key="post.id" :post="post" />
          </transition-group>
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
import { getBestPosts, getWorstPosts } from "../services/archive";

export default defineComponent({
  name: "RankingPage",
  components: {
    LoadErrorComponent,
    PostItem,
  },
  data() {
    return {
      posts: [],
      show_best: true,
      loading: true,
      loadError: "",
    };
  },
  async created() {
    await this.loadBestPosts();
  },
  methods: {
    async loadBestPosts() {
      this.show_best = true;
      await this.loadPosts(getBestPosts);
    },
    async loadWorstPosts() {
      this.show_best = false;
      await this.loadPosts(getWorstPosts);
    },
    async loadPosts(loader) {
      this.loading = true;
      this.loadError = "";

      try {
        this.posts = await loader();
      } catch (error) {
        console.error(error);
        this.loadError = "Unable to load archive rankings.";
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
