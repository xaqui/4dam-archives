<template>
  <Profile @logout="handleLogout" v-if="user" />
  <Login @loginWithGoogle="handleLoginWithGoogle" v-else />
</template>

<script>
import app from "src/boot/firebase";
import {
  onAuthStateChanged,
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import Login from "src/components/LoginComponent.vue";
import Profile from "src/components/ProfileComponent.vue";
import { defineComponent } from "vue";
import { Notify } from "quasar";

const auth = getAuth(app);

export default defineComponent({
  name: "ProfilePage",
  data() {
    return {
      user: null,
    };
  },
  created() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.handleLoginResult(user).then(() => {
          this.user = user;
        });
      }
    });
  },
  components: {
    Login,
    Profile,
  },
  methods: {
    async handleLoginWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        Notify.create({
          type: "positive",
          message: "Logged in successfully.",
        });
      } catch (error) {
        Notify.create({
          type: "negative",
          message: "Error logging in. Please try again.",
        });
        //console.error(error.message);
      }
    },
    async handleLogout() {
      try {
        await signOut(auth);
        this.user = null;
        this.$router.push({ name: "Profile" });
        Notify.create({
          type: "positive",
          message: "Logged out.",
        });
      } catch (error) {
        //console.error("Error signing out:", error.message);
      }
    },
    async handleLoginResult(user) {
      // Prepare user data
      const userData = {
        displayName: user.email == null ? null : user.displayName,
        avatar: user.email == null ? null : user.photoURL,
        uid: user.uid,
        email: user.email,
      };

      try {
        await this.$api.post("/users/", userData, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        // Notify.create({
        //   type: "negative",
        //   message: "Error sending data:" + error,
        // });

        // Log out the user if data update fails
        this.handleLogout();
      }
    },
  },
});
</script>
