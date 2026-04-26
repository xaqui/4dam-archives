<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-pt-lg q-px-md row items-center q-col-gutter-md">
        <span v-if="user">
          <span v-if="post_anonymously">Anonymous</span>
          <span v-else>
            <span v-if="nick">{{ nick }}</span>
            <span v-else>{{ user.displayName }}</span>
          </span>
        </span>
      </div>
      <div class="q-pt-sm q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            bottom-slots
            autogrow
            class="new-post"
            v-model="newPostContent"
            placeholder="What's happening?"
            counter
            maxlength="280"
          >
            <template v-slot:before>
              <avatar-component
                :displayImage="!post_anonymously && user != null"
                :imageUrl="avatar_url"
              />
            </template>
          </q-input>
        </div>
        <div class="col col-shrink">
          <div class="row">
            <q-btn
              class="q-mb-lg q-mx-xs"
              @click="showImageInput"
              unelevated
              flat
              round
              color="primary"
              icon="far fa-image"
            />
            <q-btn
              @click="addNewPost"
              class="q-mb-lg q-mx-xs"
              :disable="!newPostContent"
              unelevated
              rounded
              no-caps
              color="primary"
              label="Post"
            />
          </div>
        </div>
      </div>
      <div class="q-px-md q-pb-lg row items-end q-col-gutter-md">
        <div class="col flex-center q-px-xl">
          <q-input
            v-if="showImage"
            bottom-slots
            class="new-post"
            v-model="newPostImage"
            placeholder="Image URL"
            maxlength="2048"
          >
          </q-input>
        </div>
      </div>
      <q-separator class="divider" size="10px" />

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
        <q-item class="row justify-center">
          <q-btn
            @click="increaseDisplayPostLimit()"
            outline
            rounded
            color="primary"
            label="Load More"
        /></q-item>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import app from "src/boot/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { defineComponent, computed, onBeforeMount } from "vue";
import { Notify } from "quasar";
import { useSettingsStore } from "../pinia/settings";
import AvatarComponent from "../components/AvatarComponent.vue";
import PostItem from "../components/PostItem.vue";

const auth = getAuth(app);

export default defineComponent({
  name: "HomePage",
  setup() {
    const store = useSettingsStore();
    const post_anonymously = computed({
      get: () => store.getAnonymousMode,
    });
    onBeforeMount(() => {
      // Initialize the values based on localStorage
      // This feels very hacky
      store.setAnonymousMode(localStorage.getItem("anonymousMode") === "true");
    });
    return {
      post_anonymously,
    };
  },
  data() {
    return {
      user: null,
      displayName: null,
      nick: null,
      avatar_url: null,
      newPostContent: "",
      newPostImage: "",
      showImage: false,
      interval: null,
      posts: [
        // {
        //   id: "ID1",
        //   date: 1699446127468,
        //   content: "Sugo Sugo",
        //   media_url: null,
        //   owner: null,
        //   response_to: null,
        //   points: 0,
        // },
        // {
        //   id: "ID2",
        //   content:
        //     "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati exercitationem aliquam beatae quo sunt ducimus fugit earum odit, blanditiis dicta repellendus illo quis deleniti est. Commodi architecto in corrupti expedita.",
        //   date: 1699446127468,
        //   media_url: "/img/default-placeholder.png",
        //   owner: null,
        //   response_to: null,
        //   points: 0,
        // },
      ],
      postsDisplayAmount: 10,
      failedFetchAttempts: 0,
      maxFailedFetchAttempts: 3,
    };
  },
  components: {
    AvatarComponent,
    PostItem,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.fetchUserData();
    });
  },
  watch: {
    user(newValue) {
      if (newValue !== null) {
        this.fetchUserData();
      }
    },
  },
  created() {
    this.startRegularRequests();
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
    this.fetchPosts(this.postsDisplayAmount);
  },
  beforeUnmount() {
    this.stopFetchingPosts();
    this.postsDisplayAmount = 10;
  },
  methods: {
    showImageInput() {
      this.showImage = !this.showImage;
    },
    addNewPost() {
      let user = auth.currentUser;

      let newPost;
      this.newPostContent = this.newPostContent.trim();
      this.newPostImage = this.newPostImage.trim();

      newPost = {
        date: Date.now(),
        content: this.newPostContent,
        media_url: this.newPostImage == "" ? null : this.newPostImage,
        owner: user == null ? null : user.uid,
        response_to: null,
        points: 0,
        show_name: user == null ? false : !this.post_anonymously,
        password: localStorage.getItem("anonymousPassword"),
      };
      this.$api
        .post("/posts/", newPost, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          // Notify.create({
          //   type: "positive",
          //   message: "Response from backend:" + response.data,
          // });
          this.newPostContent = "";
          this.newPostImage = "";
          this.fetchPosts(this.postsDisplayAmount);
        })
        .catch((error) => {
          // Notify.create({
          //   type: "negative",
          //   message: "Error sending data:" + error,
          // });
        });
    },
    fetchPosts(n) {
      this.$api
        .get(`/posts/?n=${n}`)
        .then(async (response) => {
          if (Array.isArray(response.data)) {
            response.data.sort((a, b) => b.date - a.date);
            this.failedFetchAttempts = 0;
            this.posts = response.data;
          }
        })
        .catch((error) => {
          this.failedFetchAttempts++;
          //console.error("Error fetching posts");
          if (this.failedFetchAttempts == this.maxFailedFetchAttempts) {
            this.performHealthCheck();
          }
        });
    },
    performHealthCheck() {
      this.$api.get("/service/health/").catch((error) => {
        this.stopFetchingPosts();
        this.showErrorToUser(
          "Service Unavailable. Please refresh the page or try again later."
        );
      });
    },
    stopFetchingPosts() {
      clearInterval(this.interval);
      this.failedFetchAttempts = 0;
    },
    startRegularRequests() {
      this.interval = setInterval(() => {
        this.fetchPosts(this.postsDisplayAmount);
      }, 5000);
    },
    showErrorToUser(errorMessage) {
      Notify.create({
        timeout: 0,
        type: "negative",
        message: errorMessage,
        actions: [
          {
            icon: "close",
            "aria-label": "Dismiss",
          },
        ],
      });
    },
    increaseDisplayPostLimit() {
      this.postsDisplayAmount += 10;
      this.stopFetchingPosts();
      this.startRegularRequests();
    },
    fetchUserData() {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const uid = currentUser.uid;

        this.$api
          .get(`/users/${uid}`)
          .then((response) => {
            // Update user data with the retrieved data
            this.displayName = response.data.displayName;
            this.nick = response.data.nick;
            this.avatar_url = response.data.avatar;
          })
          .catch((error) => {
            //console.error("Error fetching user data:", error);
          });
      }
    },
    fetchPostsDelegated() {
      this.fetchPosts(this.postsDisplayAmount);
    },
  },
});
</script>

<style lang="scss">
.new-post textarea {
  font-size: 1rem;
  line-height: 1.4 !important;
}

.divider {
  border-top: 1px solid;
  border-bottom: 1px solid;
}

.body--light .divider {
  background-color: $grey-2;
  border-color: $border-color-light;
}

.body--dark .divider {
  background-color: $grey-10;
  border-color: $border-color-dark;
}
</style>
