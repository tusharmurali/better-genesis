<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-app-bar-nav-icon v-if="$store.getters.isLoggedIn" @click="drawer = true"/>
      <router-link to="/">
        <div class="d-flex align-center">
          <v-img
              class="shrink mr-2"
              contain
              :src="require('@/assets/logo.png')"
              transition="scale-transition"
              width="40"
          />
          <v-img
              class="shrink hidden-sm-and-down"
              contain
              min-width="100"
              :src="require('@/assets/name.png')"
              width="200"
          />
        </div>
      </router-link>
      <v-spacer/>
      <v-btn v-if="$store.getters.isLoggedIn" @click="logout" text>
        Logout
        <v-icon right>mdi-exit-to-app</v-icon>
      </v-btn>
      <v-btn v-else-if="$route.path === '/'" to="/login" text>
        Login
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" temporary app>
      <v-container>
        <StudentSelect v-if="$store.getters.isLoggedIn"/>
      </v-container>
      <v-divider/>
      <v-list nav dense>
        <v-list-item-group active-class="primary--text text--accent-4">
          <v-list-item to="/gradebook">
            <v-list-item-icon><v-icon>mdi-book-edit</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Gradebook</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/information">
            <v-list-item-icon><v-icon>mdi-calculator-variant</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Information</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/calendar">
            <v-list-item-icon><v-icon>mdi-calendar</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Calendar</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-container>
        <v-row justify="center">
          <MarkingPeriodSelect class="mb-3" v-if="$store.getters.isLoggedIn"/>
        </v-row>
      </v-container>
    </v-navigation-drawer>
    <v-main>
      <v-container>
        <router-view/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import StudentSelect from "@/components/StudentSelect";
import MarkingPeriodSelect from "@/components/MarkingPeriodSelect";

export default {
  name: 'App',
  components: { MarkingPeriodSelect, StudentSelect },
  data() {
    return {
      drawer: false,
    }
  },
  methods: {
    logout() {
      this.$store.commit("logout");
      this.$router.push("/");
    },
  }
};
</script>
