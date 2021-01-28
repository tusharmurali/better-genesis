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
    async '$store.state.studentId'(studentId) {
      await this.getGradebook(studentId);
    }
  },
  async created() {
    if (this.$store.state.studentId) await this.getGradebook(this.$store.state.studentId);
  },
  methods: {
    async getGradebook(studentId) {
      try {
        this.overlay = true;
        this.gradebook = await GenesisService.getGradebook(studentId);
        this.overlay = false;
      } catch (error) {
        console.log(error);
      }
    },
  }
}
</script>
