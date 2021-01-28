import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: "",
    students: [],
    studentId: "",
    credits: [],
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    setStudents(state, students) {
      state.students = students;
    },
    setStudentId(state, studentId) {
      state.studentId = studentId;
    },
    setCredits(state, credits) {
      state.credits = credits;
    },
    logout(state) {
      state.token = "";
      state.students = [];
      state.studentId = "";
      state.credits = [];
    },
  },
  plugins: [createPersistedState()],
});
