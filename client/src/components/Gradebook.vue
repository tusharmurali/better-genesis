<template>
  <v-row>
    <v-col xl="4" md="6" v-for="(course, index) in gradebook" :key="index">
      <CourseCard :course="course" :index="index"/>
    </v-col>
    <v-overlay :value="overlay">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-row>
</template>

<script>
import GenesisService from "@/GenesisService";
import CourseCard from "@/components/CourseCard";

export default {
  name: "Gradebook",
  components: { CourseCard },
  data() {
    return {
      gradebook: [],
      overlay: false,
    }
  },
  watch: {
    async "$store.state.studentId"(studentId) {
      await this.getGradebook(studentId, this.$store.state.markingPeriod);
    },
    async "$store.state.markingPeriod"(markingPeriod) {
      await this.getGradebook(this.$store.state.studentId, markingPeriod);
    }
  },
  async created() {
    if (this.$store.state.studentId && this.$store.state.markingPeriod) await this.getGradebook(this.$store.state.studentId, this.$store.state.markingPeriod);
  },
  methods: {
    async getGradebook(studentId, markingPeriod) {
      try {
        this.overlay = true;
        this.gradebook = await GenesisService.getGradebook(studentId, markingPeriod);
        this.overlay = false;
      } catch (error) {
        console.log(error);
      }
    },
  }
}
</script>
