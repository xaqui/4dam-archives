<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="row justify-center q-py-md header">
        <q-btn
          @click="showBestPosts()"
          flat
          round
          :color="show_best ? 'yellow-8' : 'grey-8'"
          icon="fa-solid fa-crown"
        />
        <span class="q-px-md"></span>
        <q-btn
          @click="showWorstPosts()"
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
          <post-item
            @fetch-posts-event="fetchPostsDelegated"
            v-for="post in posts"
            :key="post.id"
            :post="post"
          />
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import app from "src/boot/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { defineComponent } from "vue";
import { formatDistance } from "date-fns";
import PostItem from "../components/PostItem.vue";
const auth = getAuth(app);

export default defineComponent({
  name: "RankingPage",
  data() {
    return {
      user: null,
      posts: [],
      show_best: true,
      postsDisplayAmount: 10,
    };
  },
  components: {
    PostItem,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.showPostsDependingOnState();
    });
  },
  mounted() {
    this.showPostsDependingOnState();
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
  },
  methods: {
    formatRelativeDate(value) {
      return formatDistance(value, Date.now());
    },
    fetchPosts(n, best) {
      let url = best ? `/posts/best/` : `/posts/worst/`;
      this.$api
        .get(url + `?n=${n}`)
        .then(async (response) => {
          if (Array.isArray(response.data)) {
            response.data.sort((a, b) => b.score - a.score);
            this.posts = response.data;
          }
        })
        .catch((error) => {
          //console.error("Error fetching posts",error);
        });
    },
    showPostsDependingOnState() {
      if (this.show_best) {
        this.showBestPosts();
      } else {
        this.showWorstPosts();
      }
    },
    showBestPosts() {
      this.show_best = true;
      this.fetchPosts(this.postsDisplayAmount, true);
    },
    showWorstPosts() {
      this.show_best = false;
      this.fetchPosts(this.postsDisplayAmount, false);
    },
    fetchPostsDelegated() {
      this.showPostsDependingOnState();
    },
  },
});
</script>
