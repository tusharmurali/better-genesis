<template>
  <v-row>
    <v-col cols="6">
      <v-card>
        <v-card-title>
          GPA
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                color="primary"
                v-on="on"
                right
              >
                mdi-help-circle
              </v-icon>
            </template>
            <span>GPA is calculated as per the standards specified in the Program of Studies</span>
          </v-tooltip>
          <v-spacer/>
          <v-switch class="mt-0 pt-0" v-model="weighted" @change="getGPA" label="Weighted" hide-details/>
        </v-card-title>
        <v-card-text class="text-center">
          <v-progress-circular v-if="weighted" class="mb-6" :value="weightedGPA" :width="8" :size="250" color="primary"><div class="text-h3">{{ weightedGPA.toFixed(2) }}%</div></v-progress-circular>
          <v-progress-circular v-else class="mb-6" :value="unweightedGPA" :width="8" :size="250" color="primary"><div class="text-h3">{{ unweightedGPA.toFixed(2) }}%</div></v-progress-circular>
          <v-data-table v-if="weightedGPA" :headers="headers" :items="gradebook" disable-pagination disable-sort hide-default-footer>
            <template slot="no-data">
              <div></div>
            </template>
            <template #item.grade="{ item }">
              {{ !item.grade.includes('Not Graded') ? item.grade : "-" }}
              <v-chip class="ml-2" x-small v-if="weighted && (item.name.includes('Honors') ||
                  item.name.endsWith(' H') ||
                  item.name.includes(' H ') ||
                  item.name.includes('H-') ||
                  item.name.includes('Hon') ||
                  item.name.includes('AP'))" color="success">+5%</v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card>
        <v-card-title>Next School Day</v-card-title>
        <v-card-text class="text-center">
          <v-list-item v-if="day" class="text-left px-0">
            <v-list-item-content>
              <v-list-item-title class="text-h1">{{ day }} Day</v-list-item-title>
              <v-list-item-subtitle class="text-h5">{{ date }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-overlay absolute :value="dayOverlay">
            <v-progress-circular
                indeterminate
                size="50"
            ></v-progress-circular>
          </v-overlay>
          <v-list-item v-if="!day" class="text-left px-0">
            <v-list-item-content>
              <v-list-item-title class="text-h1"> </v-list-item-title>
              <v-list-item-subtitle class="text-h5"> </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
      </v-card>
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

export default {
  name: "Information",
  data() {
    return {
      gradebook: [],
      weighted: true,
      weightedGPA: 0,
      unweightedGPA: 0,
      headers: [{ text: "Name", value: "name" }, { text: "Grade", value: "grade" }, { text: "Credits", value: "credits" }],
      day: "",
      date: "",
      overlay: false,
      dayOverlay: false,
    }
  },
  watch: {
    async "$store.state.studentId"(studentId) {
      await this.getInformation(studentId);
    }
  },
  async created() {
    if (this.$store.state.studentId) await this.getInformation(this.$store.state.studentId);
  },
  methods: {
    async getInformation(studentId) {
      try {
        this.overlay = true;
        this.gradebook = await GenesisService.getGradebook(studentId);
        this.overlay = false;
        if (this.gradebook.length > 0) {
          if (this.$store.state.credits.length === 0) this.$store.commit("setCredits", await GenesisService.getCredits(studentId));
          for (let i = 0; i < this.gradebook.length; i++) {
            this.gradebook[i] = { ...this.gradebook[i], credits: this.$store.state.credits[i] }
          }
          [this.weightedGPA, this.unweightedGPA] = this.getGPA();
          this.dayOverlay = true;
          [this.day, this.date] = await GenesisService.getDay(studentId);
          this.dayOverlay = false;
        }
      } catch (error) {
        console.log(error);
      }
    },
    getGPA() {
      let points = 0;
      let total = 0;
      for (let i = 0; i < this.gradebook.length; i++) {
        let grade = parseFloat(this.gradebook[i].grade);
        if (!isNaN(grade)) {
          if (
              name.includes("Honors") ||
              name.endsWith(" H") ||
              name.includes(" H ") ||
              name.includes("H-") ||
              name.includes("Hon") ||
              name.includes("AP")
          )
            grade += 5;
          points += grade * this.$store.state.credits[i];
          total += this.$store.state.credits[i];
        }
      }
      const weightedGPA = points / total;

      points = 0;
      total = 0;
      for (let i = 0; i < this.gradebook.length; i++) {
        const grade = parseFloat(this.gradebook[i].grade);
        if (!isNaN(grade)) {
          points += grade * this.$store.state.credits[i];
          total += this.$store.state.credits[i];
        }
      }
      const unweightedGPA = points / total;

      return [weightedGPA, unweightedGPA];
    },
  }
}
</script>
