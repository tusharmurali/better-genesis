<template>
  <v-row>
    <v-col md="6">
      <v-card>
        <v-card-title>{{ name }}</v-card-title>
        <v-card-subtitle>
          {{ lastUpdated }}
          <v-progress-circular
            v-if="gradeOverlay"
            indeterminate
            size="20"
          ></v-progress-circular>
        </v-card-subtitle>
        <v-data-table
          v-if="name"
          :headers="headers"
          :items="assignments"
          disable-pagination
          disable-sort
          hide-default-footer
        >
          <template slot="no-data">
            <div></div>
          </template>
          <template #item.date="{ item }">
            <v-list-item class="pa-0">
              <v-list-item-content>
                <v-list-item-title>{{ item.due }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template #item.assignment="{ item }">
            <v-list-item class="pa-0" two-line>
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle style="white-space: initial">{{ item.description }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template #item.score="{ item }">
            <v-list-item class="pa-0" two-line>
              <v-list-item-content>
                <v-list-item-subtitle>{{ item.points }}</v-list-item-subtitle>
                <v-list-item-title>{{ item.grade }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
    <v-col md="6">
      <v-card class="mb-6">
        <v-card-title>Grade</v-card-title>
        <v-overlay absolute :value="gradeOverlay">
          <v-progress-circular
              indeterminate
              size="50"
          ></v-progress-circular>
        </v-overlay>
        <v-list-item v-if="gradeHistory.length > 0">
          <v-list-item-content>
            <v-list-item-title v-if="grade" class="text-h3 font-weight-black">
              {{ grade.toFixed(1) }}%
              <v-chip class="font-weight-regular" :color="trend >= 0 ? 'success' : 'red'" text-color="white">{{ trend >= 0 ? "+" + trend.toFixed(2) : trend.toFixed(2) }}</v-chip>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-else>
          <v-list-item-content>
            <v-list-item-title class="text-h3 font-weight-black"> </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-sparkline :value="gradeHistory" :gradient="['#1feaea', '#ffd200', '#f72047']" :smooth="10" :padding="16" :line-width="2" auto-draw/>
      </v-card>
      <v-card v-if="assignment">
        <v-card-title>
          Grade Calculator
        </v-card-title>
        <v-card-text class="text-center">
          <v-select
            v-model="assignment"
            label="Assignment"
            :items="ungradedAssignments"
            item-text="name"
            @input="points = Math.round(percentage * maxPoints / 10) / 10"
            return-object
          >
            <template v-slot:no-data>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>No ungraded assignments</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-select>
          <v-slider
              v-if="assignment"
              v-model="percentage"
              class="align-center"
              label="Percentage"
              @input="points = Math.round(percentage * maxPoints / 10) / 10"
              step="0.1"
          >
            <template v-slot:append>
              <v-text-field
                v-model="percentage"
                class="mt-0 pt-0"
                suffix="%"
                type="number"
                @input="points = Math.round(percentage * maxPoints / 10) / 10"
                :rules="percentageRules"
                step="0.1"
              ></v-text-field>
            </template>
          </v-slider>
          <v-slider
            v-if="assignment"
            v-model="points"
            class="align-center"
            label="Points"
            :max="maxPoints"
            @input="percentage = Math.round(points / maxPoints * 1000) / 10"
            step="0.1"
          >
            <template v-slot:append>
              <v-text-field
                v-model="points"
                class="mt-0 pt-0"
                :suffix="`/ ${maxPoints}`"
                type="number"
                @input="percentage = Math.round(points / maxPoints * 1000) / 10"
                :rules="pointsRules"
                step="0.1"
              ></v-text-field>
            </template>
          </v-slider>
          <v-progress-circular v-if="assignment" :value="projectedGrade" :size="150" color="primary"><div class="text-h4">{{ projectedGrade.toFixed(1) }}%</div></v-progress-circular>
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
  name: "Assignments",
  props: ["courseId"],
  data() {
    return {
      name: "",
      headers: [{ text: "Due", value: "date" }, { text: "Assignment", value: "assignment" }, { text: "Grade", value: "score" }],
      assignments: [],
      lastUpdated: "",
      categories: {},
      gradeHistory: [],
      earned: 0,
      attempted: 0,
      assignment: null,
      percentage: 80,
      points: 0,
      percentageRules: [
        v => v >= 0 || "Cannot be less than 0",
        v => v <= 100 || "Cannot be greater than 100"
      ],
      overlay: false,
      gradeOverlay: false,
    }
  },
  watch: {
    "$store.state.studentId"() {
      this.$router.push("/gradebook");
    },
  },
  computed: {
    isCategoricallyWeighted() {
      return Object.keys(this.categories).length > 0;
    },
    grade() {
      return this.gradeHistory[this.gradeHistory.length - 1];
    },
    trend() {
      return (this.gradeHistory[this.gradeHistory.length - 1] - this.gradeHistory[this.gradeHistory.length - 2]);
    },
    ungradedAssignments() {
      return this.assignments.filter(assignment => assignment.grade.includes('Not Graded'));
    },
    maxPoints() {
      return this.assignment.points.split(": ")[1];
    },
    pointsRules() {
      return [
        v => v >= 0 || "Cannot be less than 0",
        v => v <= this.maxPoints || `Cannot be greater than ${this.maxPoints}`
      ]
    },
    projectedGrade() {
      return this.getGrade(this.points, this.maxPoints, this.assignment.category);
    }
  },
  async created() {
    this.overlay = true;
    [this.name, this.assignments] = await GenesisService.getAssignments(this.$store.state.studentId, this.courseId);
    this.overlay = false;
    this.gradeOverlay = true;
    [this.lastUpdated, this.categories] = await GenesisService.getSummary(this.$store.state.studentId, this.courseId);
    this.gradeHistory = this.getGradeHistory();
    if (this.ungradedAssignments.length > 0) {
      this.assignment = this.ungradedAssignments[0];
      this.points = this.percentage * this.maxPoints / 100;
    }
    this.gradeOverlay = false;
  },
  methods: {
    getGrade(points, total, assignmentCategory) {
      if (this.isCategoricallyWeighted) {
        let grade = 0;
        let graded = 0;
        for (const category in this.categories) {
          if (category === assignmentCategory) {
            grade += (this.categories[category].points + points) / (this.categories[category].total + parseFloat(total)) * this.categories[category].weight;
            graded += this.categories[category].weight;
          } else if (this.categories[category].total !== 0) {
            grade += this.categories[category].points / this.categories[category].total * this.categories[category].weight;
            graded += this.categories[category].weight;
          }
        }
        return grade / graded * 100;
      } else {
        return (this.earned + points) / (this.attempted + parseFloat(total)) * 100;
      }
    },
    getGradeHistory() {
      let history = [];
      if (this.isCategoricallyWeighted) {
        for (let i = this.assignments.length - 1; i >= 0; i--) {
          const [points, total] = this.assignments[i].points.split(" / ");
          if (points && total) {
            this.categories[this.assignments[i].category].points += parseFloat(points);
            this.categories[this.assignments[i].category].total += parseFloat(total);
            let grade = 0;
            let graded = 0;
            for (const category in this.categories) {
              if (this.categories[category].total !== 0) {
                grade += this.categories[category].points / this.categories[category].total * this.categories[category].weight;
                graded += this.categories[category].weight;
              }
            }
            history.push(grade / graded * 100);
          }
        }
      } else {
        for (let i = this.assignments.length - 1; i >= 0; i--) {
          const [points, total] = this.assignments[i].points.split(" / ");
          if (points && total) {
            this.earned += parseFloat(points);
            this.attempted += parseFloat(total);
            history.push(this.earned / this.attempted * 100);
          }
        }
      }
      return history;
    }
  }
}
</script>