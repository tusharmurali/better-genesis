<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
            :src="require('../assets/logo.png')"
            class="my-3"
            contain
            height="200"
        />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to BetterGenesis
        </h1>

        <p class="subheading font-weight-regular">
          For more information on how BetterGenesis works,
          <br>please check out our
          <a
              href="https://github.com/tooshwhoosh/better-genesis"
              target="_blank"
          >Github Repository</a>
        </p>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="4">
        <v-list-item three-line>
        <v-list-item-icon><v-icon>mdi-thumb-up</v-icon></v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Convenient</v-list-item-title>
          <v-list-item-subtitle>
            No calculators or calendars needed.
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            Just one dreadfully easy dashboard.
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
        <v-list-item three-line>
          <v-list-item-icon><v-icon>mdi-bullseye-arrow</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Accurate</v-list-item-title>
            <v-list-item-subtitle>
              All grades are straight from Genesis.
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              No lying, no modifying, no B.S.
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-col>
      <v-col cols="4">
        <v-list-item three-line>
          <v-list-item-icon><v-icon>mdi-shield-check</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Reliable</v-list-item-title>
            <v-list-item-subtitle>
              We <u>never</u> store your information.
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              It's sent straight to Genesis and back.
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item three-line>
          <v-list-item-icon><v-icon>mdi-lock</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Secure</v-list-item-title>
            <v-list-item-subtitle>
              We encrypt your session data with
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              industry standard AES-256.
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Home",
}
</script>
