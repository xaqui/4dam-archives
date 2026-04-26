<template>
  <q-page class="relative-position">
    <div class="absolute-center full-height full-width">
      <div class="q-py-lg q-px-md col items-center justify-center">
        <div class="row justify-center items-center">
          <q-item-section avatar top>
            <q-avatar size="xl">
              <img
                :src="user.avatar_url || 'img/unknown-avatar.png'"
                alt="User Avatar"
              />
            </q-avatar>
          </q-item-section>
        </div>
        <div class="row justify-center items-center q-py-md">
          <p>
            Logged in as
            <span v-if="user.nick">{{ user.nick }}</span>
            <span v-else>{{ user.displayName }}</span>
          </p>
        </div>
        <div class="q-px-lg">
          <div class="row items-center q-px-lg">
            <div class="col">
              <q-input
                type="text"
                v-model="nick"
                placeholder="Choose username"
                :maxlength="32"
              />
            </div>
            <q-btn @click="submitUsername" label="Submit" color="primary" />
          </div>
          <div class="row items-center q-px-lg">
            <div class="col">
              <q-input
                type="text"
                v-model="avatar_url"
                placeholder="Profile picture URL"
                :maxlength="1024"
              />
            </div>
            <q-btn @click="submitProfilePic" label="Submit" color="primary" />
          </div>
        </div>
      </div>
      <div class="row justify-center">
        <q-btn
          rounded
          icon="fa-solid fa-person-running"
          @click="$emit('logout')"
          label="Log out"
          color="primary"
          class="q-py-sm"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import app from "src/boot/firebase";
import { getAuth } from "firebase/auth";

const auth = getAuth(app);

export default {
  data() {
    return {
      user: {
        displayName: null,
        nick: null,
        avatar_url: null,
      },
      displayName: null,
      nick: null,
      avatar_url: null,
    };
  },
  created() {
    // Access the current user information
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Update user data
      this.fetchUserData();
    }
  },
  methods: {
    submitUsername() {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const uid = currentUser.uid;
        this.$api
          .put(`/users/${uid}`, {
            uid: uid,
            nick: this.nick == null ? this.nick : this.nick.trim(),
            avatar:
              this.user.avatar_url == null
                ? this.user.avatar_url
                : this.user.avatar_url.trim(),
          })
          .then((response) => {
            //console.log("User data updated successfully:", response.data);
            this.fetchUserData();
            this.nick = null;
          })
          .catch((error) => {
            //console.error("Error updating user data:", error);
          });
      }
    },
    submitProfilePic() {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const uid = currentUser.uid;

        this.$api
          .put(`/users/${uid}`, {
            uid: uid,
            nick:
              this.user.nick == null ? this.user.nick : this.user.nick.trim(),
            avatar:
              this.avatar_url == null
                ? this.avatar_url
                : this.avatar_url.trim(),
          })
          .then((response) => {
            //console.log("User data updated successfully:", response.data);
            this.fetchUserData();
            this.avatar_url = null;
          })
          .catch((error) => {
            //console.error("Error updating user data:", error);
          });
      }
    },

    fetchUserData() {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const uid = currentUser.uid;

        this.$api
          .get(`/users/${uid}`)
          .then((response) => {
            // Update user data with the retrieved data
            this.user.displayName = response.data.displayName;
            this.user.nick = response.data.nick;
            this.user.avatar_url = response.data.avatar;
          })
          .catch((error) => {
            //console.error("Error fetching user data:", error);
          });
      }
    },
  },
};
</script>
