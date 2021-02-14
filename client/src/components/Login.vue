<template>
  <v-row justify="center">
    <v-col md="4" sm="8" cols="12">
      <v-banner class="text-caption" icon="mdi-lock">Your login information is secure with industry standard AES-256 encryption.</v-banner>
      <v-card>
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error">{{ error }}</v-alert>
          <v-form v-model="valid" ref="form" @keyup.native.enter="submit">
            <v-text-field
                prepend-icon="mdi-account"
                v-model="username"
                :rules="usernameRules"
                label="Username"
            />
            <v-text-field
                prepend-icon="mdi-lock"
                v-model="password"
                :rules="passwordRules"
                label="Password"
                type="password"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn @click="submit" color="primary">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import GenesisService from "@/GenesisService";
import axios from "axios";

export default {
  name: "Login",
  data() {
    return {
      valid: false,
      username: "",
      usernameRules: [ v => !!v || "Username is required", v => /.+@.+\..+/.test(v) || "Username must be valid" ],
      password: "",
      passwordRules: [ v => !!v || "Password is required" ],
      error: ""
    }
  },
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        try {
          const token = await GenesisService.login({username: this.username, password: this.password});
          axios.defaults.headers.common["Authorization"] = token;
          this.$store.commit("setToken", token);
          await this.$router.push("/gradebook");
        } catch (error) {
          this.error = error.response.data;
        }
      }
    }
  }
}
</script>

<style scoped>

</style>