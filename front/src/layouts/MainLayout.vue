<template>
  <q-layout view="lHh Lpr lFf">
    <div class="flex flex-center column">
      <div id="parent" class="full-width row no-wrap" style="overflow: hidden">
        <div
          class="col-sm-2 col-md-3 col-lg-4 left-sidebar"
          style="overflow: auto"
        >
          <q-icon
            class="q-pa-md"
            name="img:img/logo.svg"
            size="lg"
            color="primary"
          />
          <q-list class="q-pl-sm">
            <q-item to="/" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon name="fa-solid fa-home" size="sm" />
              </q-item-section>

              <q-item-section class="text-h6 text-weight-bold gt-sm"
                >Home</q-item-section
              >
            </q-item>

            <q-item to="/profile" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon name="fa-solid fa-user" size="sm" />
              </q-item-section>

              <q-item-section class="text-h6 text-weight-bold gt-sm"
                >Profile</q-item-section
              >
            </q-item>

            <q-item to="/ranking" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon name="fa-solid fa-crown" size="sm" />
              </q-item-section>

              <q-item-section class="text-h6 text-weight-bold gt-sm"
                >Ranking</q-item-section
              >
            </q-item>
            <q-item to="/settings" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon name="fa-solid fa-gear" size="sm" />
              </q-item-section>

              <q-item-section class="text-h6 text-weight-bold gt-sm"
                >Settings</q-item-section
              >
            </q-item>
            <q-item to="/about" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon name="help" size="sm" />
              </q-item-section>

              <q-item-section class="text-h6 text-weight-bold gt-sm"
                >About</q-item-section
              >
            </q-item>
          </q-list>
        </div>

        <div class="self-center main-content">
          <div class="col content-center">
            <div class="relative-position">
              <div class="row items-center justify-center header">
                <div class="q-px-lg full-height q-py-md">
                  <span class="gt-sm q-py-md text-weight-bold">{{
                    $route.name
                  }}</span>
                  <q-icon
                    class="q-pa-md lt-md"
                    name="img:img/logo.svg"
                    size="lg"
                    color="primary"
                  />
                </div>
              </div>
            </div>

            <q-page-container>
              <router-view v-slot="{ Component }">
                <keep-alive>
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </q-page-container>
          </div>
        </div>

        <div class="col-grow gt-xs right-sidebar" style="overflow: auto"></div>
      </div>
    </div>
  </q-layout>
</template>

<script>
import DarkModeMixin from "../mixins/darkMode";
import AnonymousModeMixin from "../mixins/anonymousMode";
import AnonymousPasswordMixin from "../mixins/anonymousPassword";
import logo from "../assets/logo.svg";

export default {
  setup() {
    return logo;
  },
  mixins: [DarkModeMixin, AnonymousModeMixin, AnonymousPasswordMixin],
};
</script>

<style lang="scss">
.header-icon {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.body--light {
  background: white;
  color: black;
}

.body--dark {
  background: #121212;
  color: white;
}

.blue {
  background: cornflowerblue;
}

.left-sidebar {
  min-width: 72px;
  border-right: 1px solid;
}

.body--dark .left-sidebar {
  border-color: $border-color-dark;
}

.body--light .left-sidebar {
  border-color: $border-color-light;
}

.right-sidebar {
  border-left: 1px solid;
}

.body--dark .right-sidebar {
  border-color: $border-color-dark;
}

.body--light .right-sidebar {
  border-color: $border-color-light;
}

.header {
  border-bottom: 1px solid;
}

.body--dark .header {
  border-color: $border-color-dark;
}

.body--light .header {
  border-color: $border-color-light;
}

.main-content {
  max-width: 600px;
  min-width: 600px;
  width: 600px;
  margin: 0;
  overflow: auto;
}

@media screen and (max-width: 600px) {
  .main-content {
    max-width: 100%;
    min-width: 370px;
    overflow: auto;
    margin: 0;
  }
}
</style>
