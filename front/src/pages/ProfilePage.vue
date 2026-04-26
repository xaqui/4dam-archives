<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <load-error-component v-if="loadError" :message="loadError" />
      <div v-else class="q-pa-md">
        <div class="row items-center justify-center q-col-gutter-md">
          <h4 class="q-mt-none q-mb-md text-weight-bold">People</h4>
        </div>
        <div class="row q-col-gutter-md">
          <div
            v-for="person in people"
            :key="person.uid"
            class="col-12 col-sm-6"
          >
            <q-card flat bordered class="full-height">
              <q-card-section class="row items-center no-wrap q-col-gutter-md">
                <div class="col-auto">
                  <avatar-component :displayImage="true" :imageUrl="person.avatar" />
                </div>
                <div class="col">
                  <div class="text-subtitle1 text-weight-bold">
                    {{ person.nick || person.displayName || person.uid }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <q-item v-if="loading" class="row justify-center q-py-xl">
          <q-spinner color="primary" size="2em" />
        </q-item>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import AvatarComponent from "../components/AvatarComponent.vue";
import LoadErrorComponent from "../components/LoadErrorComponent.vue";
import { getPeople } from "../services/archive";

export default defineComponent({
  name: "PeoplePage",
  components: {
    AvatarComponent,
    LoadErrorComponent,
  },
  data() {
    return {
      people: [],
      loading: true,
      loadError: "",
    };
  },
  async created() {
    this.loading = true;
    this.loadError = "";

    try {
      this.people = await getPeople();
    } catch (error) {
      console.error(error);
      this.loadError = "Unable to load archived people.";
    } finally {
      this.loading = false;
    }
  },
});
</script>
