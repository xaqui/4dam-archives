<template>
  <q-item class="post q-py-md">
    <q-item-section class="q-px-md q-pt-sm">
      <div class="row">
        <q-item-section avatar>
          <avatar-component
            :displayImage="post.show_name"
            :imageUrl="post.avatar"
          />
        </q-item-section>
        <q-item-label class="text-subtitle1 post-meta q-py-sm col">
          <span class="text-grey-7">
            <span v-if="post.show_name && post.username">{{
              post.username
            }}</span>
            <span v-else>Anonymous</span>
          </span>
          <span class="q-px-sm">&bull;</span>

          <span class="q-px-xs date">{{ formatRelativeDate(post.date) }} </span>
        </q-item-label>
        <q-item-label class="col-shrink">
          <q-btn
            color="grey-4"
            icon="fa-solid fa-ellipsis-vertical"
            rounded
            flat
          >
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="deletePost(post)">
                  <q-item-section>
                    <q-item-label
                      ><q-icon
                        name="fas fa-trash"
                        size="xs"
                        color="negative"
                        class="q-pr-md"
                      />Delete Post</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-label>
      </div>

      <q-item-label class="post-content text-body1 q-py-md q-px-md"
        >{{ post.content }}
      </q-item-label>
      <div class="post-image row flex-center q-py-sm q-px-md">
        <q-img
          v-if="post && post.media_url"
          :src="post.media_url"
          loading="lazy"
          spinner-color="white"
          height="30rem"
          ratio="1"
          fit="scale-down"
          class="rounded-borders"
          @error="handleImageError"
        />
      </div>
      <div class="post-icons row justify-center q-mt-sm q-mx-md">
        <div class="justify-between flex-center">
          <q-btn
            class="down-icon"
            flat
            round
            icon="fa-solid fa-arrow-down"
            size="sm"
            :ripple="{ color: 'blue' }"
            @click="downVote(post)"
          />
          <span class="col self-center q-px-sm">{{ post.points }}</span>
          <q-btn
            class="up-icon"
            flat
            round
            icon="fa-solid fa-arrow-up"
            size="sm"
            :ripple="{ color: 'positive' }"
            @click="upVote(post)"
          />
        </div>
      </div>
    </q-item-section>

    <q-item-section side top> </q-item-section>
  </q-item>
</template>

<script>
import app from "src/boot/firebase";
import { getAuth } from "firebase/auth";
import AvatarComponent from "../components/AvatarComponent.vue";
import { Notify } from "quasar";
import { formatDistance } from "date-fns";

const auth = getAuth(app);

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
  methods: {
    handleImageError(event) {
      event.target.src = "/img/default-placeholder.png";
    },
    deletePost(post) {
      let user = auth.currentUser;
      let data = {
        user_id: user ? user.uid : null,
        password: localStorage.getItem("anonymousPassword"),
      };
      this.$api
        .delete(`/posts/${post.id}`, {
          headers: { "Content-Type": "application/json" },
          data: {
            user_id: data.user_id,
            password: data.password,
          },
        })
        .then((response) => {
          if (response.status === 204) {
            Notify.create({
              type: "positive",
              message: "Post deleted successfully.",
            });
            this.$emit("fetch-posts-event");
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            Notify.create({
              type: "negative",
              message: "You don't have permission to delete this post.",
            });
          } else {
            Notify.create({
              type: "negative",
              message: "Error deleting post: " + error.response.status,
            });
          }
        });
    },
    upVote(post) {
      let user = auth.currentUser;
      if (!user) {
        this.requireLogin("vote");
        return;
      }

      let data = {
        user_id: user.uid,
        rate_up: true,
      };

      this.$api
        .put(`/posts/${post.id}/rate`, data, {
          headers: { "Content-Type": "application/json" },
        })
        .then(() => {
          // Notify.create({
          //   type: "positive",
          //   message: "Post Rated UP.",
          // });
          this.$emit("fetch-posts-event");
        })
        .catch((error) => {
          // Notify.create({
          //   type: "negative",
          //   message: "ERROR: " + error,
          // });
        });
    },
    downVote(post) {
      let user = auth.currentUser;
      if (!user) {
        this.requireLogin("vote");
        return;
      }

      let data = {
        user_id: user.uid,
        rate_up: false,
      };

      this.$api
        .put(`/posts/${post.id}/rate`, data, {
          headers: { "Content-Type": "application/json" },
        })
        .then(() => {
          // Notify.create({
          //   type: "positive",
          //   message: "Post Rated DOWN.",
          // });
          this.$emit("fetch-posts-event");
        })
        .catch((error) => {
          // Notify.create({
          //   type: "negative",
          //   message: "ERROR: " + error,
          // });
        });
    },
    formatRelativeDate(value) {
      return formatDistance(value, Date.now());
    },
    requireLogin(action) {
      Notify.create({
        type: "negative",
        message: "You need to log in to " + action + ".",
      });
      this.$router.push({ path: "/profile" });
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

.post:not(:first-child) {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.up-icon:hover {
  color: $positive;
}

.down-icon:hover {
  color: cornflowerblue;
}
</style>
