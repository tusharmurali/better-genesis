<template>
  <v-btn-toggle
    :value="$store.state.markingPeriod"
    color="primary"
    @change="setMarkingPeriod"
    mandatory
  >
    <v-btn value="MP1">
      MP1
    </v-btn>
    <v-btn value="MP2">
      MP2
    </v-btn>
  </v-btn-toggle>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "MarkingPeriodSelect",
  async created() {
    if (!this.$store.state.markingPeriod) {
      const month = new Date().getMonth() + 1;
      this.$store.commit("setMarkingPeriod", month >= 9 || month === 1 ? "MP1" : "MP2");
    }
  },
  methods: mapMutations(["setMarkingPeriod"])
}
</script>

<style scoped>

</style>