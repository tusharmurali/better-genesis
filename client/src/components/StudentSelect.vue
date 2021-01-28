<template>
  <v-select
    :value="$store.state.studentId"
    @change="setStudentId"
    :items="$store.state.students"
    item-value="id"
    item-text="name"
    label="Student"
    hide-details
  />
</template>

<script>
import { mapMutations } from "vuex";
import GenesisService from "@/GenesisService";

export default {
  name: "StudentSelect",
  async created() {
    if (this.$store.state.students.length === 0) this.$store.commit("setStudents", await GenesisService.getStudents());
    if (!this.$store.state.studentId) this.$store.commit("setStudentId", this.$store.state.students[0].id);
  },
  methods: mapMutations(["setStudentId"])
}
</script>