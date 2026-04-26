// mixins/anonymousPassword.js

export default {
  created() {
    // Retrieve the value of anonymousPassword from localStorage
    const anonymousPasswordValue = localStorage.getItem("anonymousPassword");
    if (anonymousPasswordValue === null) {
      const randomString = Math.random().toString(36).substring(2, 38);
      localStorage.setItem("anonymousPassword", randomString);
    }
  },
};
