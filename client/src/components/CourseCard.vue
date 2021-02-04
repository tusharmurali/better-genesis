<template>
  <v-card height="100%" :to="graded ? `/assignments/${course.id}` : ''">
    <v-sheet :color="colors[index]">
      <v-card-title>
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title class="white--text">{{ course.name }}</v-list-item-title>
            <v-list-item-subtitle class="white--text">{{ course.teacher }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action v-if="graded" class="text-h6 font-weight-black white--text">
            {{ !course.grade.endsWith("%") ? course.grade + "%" : course.grade }}
          </v-list-item-action>
          <v-list-item-action v-else class="text-h6 font-weight-black white--text">-</v-list-item-action>
        </v-list-item>
      </v-card-title>
    </v-sheet>
    <v-card-text class="text-center" style="position: relative">
      <v-overlay absolute :value="overlay">
        Fetching assignments...
      </v-overlay>
      <v-list-item class="text-left" dense v-for="assignment in weeklyAssignments" :key="assignment.id">
        <v-list-item-content>
          <v-list-item-subtitle>
            Due {{ assignment.due }}
          </v-list-item-subtitle>
          <v-list-item-title>
            {{ assignment.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-card-text>
  </v-card>
</template>

<script>
import GenesisService from "@/GenesisService";

export default {
  name: "CourseCard",
  props: ["course", "index"],
  data() {
    return {
      weekly: [],
      colors: ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "blue-grey", "grey"],
      overlay: false,
    }
  },
  watch: {
    async "$store.state.markingPeriod"(markingPeriod) {
      await this.getWeekly(this.$store.state.studentId, this.course.id, markingPeriod);
    }
  },
  computed: {
    graded() {
      return !this.course.grade.includes('Not Graded');
    },
    weeklyAssignments() {
      const today = new Date();
      const newYear = today.getMonth() + 1 <= 6;
      return this.weekly.filter(assignment => {
        const due = assignment.due.split(" ")[1];
        const month = parseInt(due.split("/")[0]);
        let date = new Date(`${due}/${today.getFullYear()}`);
        if (month <= 6 && !newYear)
          date = new Date(`${due}/${today.getFullYear() + 1}`)
        else if (month >= 6 && newYear)
          date = new Date(`${due}/${today.getFullYear() - 1}`);
        date.setHours(23,59,59,999);
        return today < date;
      })
    }
  },
  async created() {
    await this.getWeekly(this.$store.state.studentId, this.course.id, this.$store.state.markingPeriod);
  },
  methods: {
    async getWeekly(studentId, markingPeriod) {
      try {
        const month = new Date().getMonth() + 1;
        if (this.$store.state.markingPeriod === (month >= 9 || month === 1 ? "MP1" : "MP2")) {
          this.overlay = true;
          this.weekly = await GenesisService.getWeekly(studentId, markingPeriod);
          this.overlay = false;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>