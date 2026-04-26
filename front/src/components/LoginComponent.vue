<template>
  <q-page class="relative-position">
    <div class="absolute-center full-height">
      <div class="row items-center justify-center q-col-gutter-md">
        <h2 class="text-h2 text-weight-bold">Login</h2>
      </div>
      <div class="row items-center justify-center">
        <div class="row q-py-md">
          <q-btn
            @click="$emit('loginWithGoogle')"
            color="primary"
            no-caps
            class="q-pa-md"
            icon="fa-brands fa-google"
            label="Login with Google"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
