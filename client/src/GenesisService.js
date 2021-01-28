import axios from "axios";
import store from "./store";
import router from "./router";

axios.defaults.baseURL = "/api/genesis";

axios.interceptors.request.use(
  function (config) {
    config.headers["Authorization"] = store.state.token;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 401) {
      store.commit("logout");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

class GenesisService {
  static login(user) {
    return axios.post("login", user).then((response) => response.data);
  }
  static getStudents() {
    return axios.get("students").then((response) => response.data);
  }
  static getGradebook(studentId) {
    return axios
      .post("gradebook", { studentId })
      .then((response) => response.data);
  }
  static getCredits(studentId) {
    return axios
      .post("credits", { studentId })
      .then((response) => response.data);
  }
  static getAssignments(studentId, courseId) {
    return axios
      .post("assignments", { studentId, courseId })
      .then((response) => response.data);
  }
  static getSummary(studentId, courseId) {
    return axios
      .post("summary", { studentId, courseId })
      .then((response) => response.data);
  }
  static getWeekly(studentId, courseId) {
    return axios
      .post("weekly", { studentId, courseId })
      .then((response) => response.data);
  }
  static getDay(studentId) {
    return axios.post("day", { studentId }).then((response) => response.data);
  }
}

export default GenesisService;
