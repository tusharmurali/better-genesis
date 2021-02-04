<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          <v-btn outlined @click="focus = ''">Today</v-btn>
          <v-btn
              icon
              @click="$refs.calendar.prev()"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
              icon
              @click="$refs.calendar.next()"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <div v-if="$refs.calendar" class="text-h6">{{ $refs.calendar.title }}</div>
          <v-spacer/>
          <v-menu>
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on">
                {{ typeToLabel[type] }}
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-content>
                  <v-list-item-title>Day</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-content>
                  <v-list-item-title>Week</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-content>
                  <v-list-item-title>Month</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-content>
                  <v-list-item-title>4 Days</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-title>
        <v-overlay absolute :value="overlay">
          <v-progress-circular
              indeterminate
              size="50"
          ></v-progress-circular>
        </v-overlay>
        <v-calendar v-model="focus" ref="calendar" :type="type" :events="events" :event-color="event => event.color">
          <template v-slot:event="{ event }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on" class="pl-1"><b>{{ event.name }}</b>, {{event.course}}</div>
              </template>
              {{ event.name }}, {{ event.course }}
            </v-tooltip>
          </template>
        </v-calendar>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import GenesisService from "@/GenesisService";

export default {
  name: "Calendar",
  data() {
    return {
      focus: "",
      type: "month",
      typeToLabel: {
        month: "Month",
        week: "Week",
        day: "Day",
        "4day": "4 Days",
      },
      assignments: [],
      colors: ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "blue-grey", "grey"],
      colorCodes: {},
      overlay: false,
    }
  },
  watch: {
    async "$store.state.studentId"(studentId) {
      await this.getCalendar(studentId, this.$store.state.markingPeriod);
    },
    async "$store.state.markingPeriod"(markingPeriod) {
      await this.getCalendar(this.$store.state.studentId, markingPeriod);
    }
  },
  computed: {
    events() {
      const today = new Date();
      const newYear = today.getMonth() + 1 <= 6;
      return this.assignments.map(assignment => {
        const due = assignment.due.split(" ")[1];
        const month = parseInt(due.split("/")[0]);
        let date = new Date(`${due}/${today.getFullYear()}`);
        if (month <= 6 && !newYear)
          date = new Date(`${due}/${today.getFullYear() + 1}`)
        else if (month >= 6 && newYear)
          date = new Date(`${due}/${today.getFullYear() - 1}`);
        return {
          name: assignment.name,
          course: assignment.course,
          start: date,
          color: this.colorCodes[assignment.course],
        }
      })
    }
  },
  async created() {
    if (this.$store.state.studentId && this.$store.state.markingPeriod) await this.getCalendar(this.$store.state.studentId, this.$store.state.markingPeriod);
  },
  methods: {
    async getCalendar(studentId, markingPeriod) {
      try {
        this.overlay = true;
        let t0 = performance.now();
        this.assignments = (await GenesisService.getAssignments(studentId, "", markingPeriod))[1];
        this.assignments.map(assignment => assignment.course).filter((course, i, courses) => courses.indexOf(course) === i).forEach((course, index) => {
          this.colorCodes[course] = this.colors[index];
        })
        let t1 = performance.now();
        console.log(t1-t0);
        this.overlay = false;
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>