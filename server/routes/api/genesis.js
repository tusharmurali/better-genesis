const express = require("express");
const querystring = require("querystring");
const axios = require("axios");
const cheerio = require("cheerio");
const aes256 = require("aes256");

const cipher = aes256.createCipher("Ankita's birthday");
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(
      "https://parents.mtsd.k12.nj.us/genesis/j_security_check",
      querystring.stringify({
        j_username: req.body.username,
        j_password: req.body.password,
      }),
      {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status <= 302,
      }
    );
    if (!response.headers["location"].includes("data"))
      res.status(401).send("Incorrect username or password");
    else res.send(cipher.encrypt(response.headers["set-cookie"][0]));
  } catch (error) {
    console.log(error);
  }
});

router.get("/students", async (req, res) => {
  try {
    const response = await axios.get(
      "https://parents.mtsd.k12.nj.us/genesis/parents?tab1=studentdata&tab2=studentsummary",
      { headers: { Cookie: cipher.decrypt(req.get("Authorization")) } }
    );

    const $ = cheerio.load(response.data);
    const students = $("#fldStudent option")
      .map(function () {
        return { id: $(this).val(), name: $(this).text() };
      })
      .get();

    if (students.length === 0) res.sendStatus(401);
    else res.send(students);
  } catch (error) {
    console.log(error);
  }
});

router.post("/gradebook", async (req, res) => {
  try {
    const response = await axios.get(
      `https://parents.mtsd.k12.nj.us/genesis/parents?tab1=studentdata&tab2=gradebook&action=form&studentid=${req.body.studentId}`,
      { headers: { Cookie: cipher.decrypt(req.get("Authorization")) } }
    );
    const $ = cheerio.load(response.data);
    const gradebook = $(".list > tbody > tr")
      .slice(1)
      .map(function () {
        const cells = $(this).find(".cellLeft");
        return {
          id: cells.eq(0).children().attr("onclick").split("'")[3],
          name: cells.eq(0).text().trim(),
          teacher: cells.eq(1).children().remove().end().text().trim(),
          grade: $(this).find("> .cellRight").text().trim(),
        };
      })
      .get();

    if (gradebook.length === 0) res.sendStatus(401);
    else res.send(gradebook);
  } catch (error) {
    console.log(error);
  }
});

router.post("/credits", async (req, res) => {
  try {
    const response = await axios.get(
      `https://parents.mtsd.k12.nj.us/genesis/parents?tab1=studentdata&tab2=grading&action=form&studentid=${req.body.studentId}`,
      { headers: { Cookie: cipher.decrypt(req.get("Authorization")) } }
    );
    const $ = cheerio.load(response.data);
    const credits = $(".list > tbody > tr")
      .slice(1)
      .map(function () {
        return parseFloat($(this).find(".cellLeft").eq(7).text());
      })
      .get();

    if (credits.length === 0) res.sendStatus(401);
    else res.send(credits);
  } catch (error) {
    console.log(error);
  }
});

router.post("/assignments", async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;

    let dateRange = "allMP";
    if (month >= 9 || month === 1) dateRange = "MP1";
    if (month >= 2 && month <= 6) dateRange = "MP2";

    const date =
      month.toString().padStart(2, "0") +
      "/" +
      today.getDate().toString().padStart(2, "0") +
      "/" +
      today.getFullYear();

    const response = await axios.get(
      `https://parents.mtsd.k12.nj.us/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=listassignments&studentid=${req.body.studentId}&action=form&dateRange=${dateRange}&date=${date}&courseAndSection=${req.body.courseId}`,
      { headers: { Cookie: cipher.decrypt(req.get("Authorization")) } }
    );

    const $ = cheerio.load(response.data);
    const assignments = $(".list > tbody > tr")
      .slice(1)
      .map(function (id) {
        const cells = $(this).find(".cellLeft");
        const dueCell = $(this).find("> .cellCenter").eq(0).children();
        const descriptionCell = cells.eq(3).children();
        const gradeCell = cells.eq(4).children().eq(0).remove();
        const children = gradeCell.children();
        let points = cells.eq(4).text().trim();
        let grade = gradeCell.text().trim();
        if (children.length > 1) {
          points = children.eq(1).text();
          grade = children.eq(0).text();
        } else if (children.length > 0) {
          [points, grade] = [grade, points];
        }
        return {
          id,
          name: cells.eq(3).children().eq(0).text(),
          description:
            descriptionCell.length > 2 ? descriptionCell.eq(1).text() : "",
          due: dueCell.eq(0).text() + " " + dueCell.eq(1).text(),
          category: cells.eq(2).children().remove().end().text().trim(),
          points,
          grade,
        };
      })
      .get();

    if (assignments.length === 0) res.sendStatus(401);
    else res.send([$("#fldCourse option:selected").text(), assignments]);
  } catch (error) {
    console.log(error);
  }
});

router.post("/summary", async (req, res) => {
  try {
    const [course, section] = req.body.courseId.split(":");

    const response = await axios.get(
      `https://parents.mtsd.k12.nj.us/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=coursesummary&action=form&studentid=${req.body.studentId}&courseCode=${course}&courseSection=${section}`,
      { headers: { Cookie: cipher.decrypt(req.get("Authorization")) } }
    );

    const $ = cheerio.load(response.data);
    const summary = $(".list > tbody").eq(0);
    const lastUpdated = summary.find("> tr").eq(0).find("div").eq(1).text();
    const grading = summary.find("> tr").eq(-2);
    let categories = {};
    grading
      .find(".list > tbody > tr")
      .slice(1)
      .each(function () {
        const row = $(this).children();
        categories[row.eq(0).text()] = {
          weight: parseFloat(row.eq(1).text()),
          points: 0,
          total: 0,
        };
      });

    if (!grading.find("b").eq(1).text()) res.sendStatus(401);
    else res.send([lastUpdated, categories]);
  } catch (error) {
    console.log(error);
  }
});

router.post("/weekly", async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;

    const date =
      month.toString().padStart(2, "0") +
      "/" +
      today.getDate().toString().padStart(2, "0") +
      "/" +
      today.getFullYear();

    const response = await axios.get(
      `https://parents.mtsd.k12.nj.us/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=listassignments&studentid=${req.body.studentId}&action=form&dateRange=weekof&date=${date}&courseAndSection=${req.body.courseId}`,
      { headers: { Cookie: cipher.decrypt(req.get("Authorization")) } }
    );

    const $ = cheerio.load(response.data);
    let weekly = $(".list > tbody > tr").slice(1);
    if (weekly.children().length !== 1)
      res.send(
        weekly
          .map(function (id) {
            const cells = $(this).find(".cellLeft");
            const dueCell = $(this).find("> .cellCenter").eq(0).children();
            return {
              id,
              name: cells.eq(3).children().eq(0).text(),
              due: dueCell.eq(0).text() + " " + dueCell.eq(1).text(),
            };
          })
          .get()
          .reverse()
      );
    else if (weekly.children().length === 1) res.send([]);
    else res.sendStatus(401);
  } catch (error) {
    console.log(error);
  }
});

router.post("/day", async (req, res) => {
  try {
    const response = await axios.get(
      `https://parents.mtsd.k12.nj.us/genesis/parents?tab1=studentdata&tab2=attendance&tab3=class&action=form&studentid=${req.body.studentId}`,
      { headers: { Cookie: cipher.decrypt(req.get("Authorization")) } }
    );

    const $ = cheerio.load(response.data);
    const dates = $(".list")
      .eq(0)
      .find("> tbody > tr")
      .slice(1)
      .map(function () {
        const row = $(this).children();
        const date = new Date(`${row.eq(1).text().trim()}`);
        date.setHours(7, 30, 0);
        return {
          day: row.eq(0).text().trim(),
          date,
        };
      })
      .get();

    const today = new Date();

    let lo = 0;
    let hi = dates.length - 1;
    while (lo <= hi) {
      let mid = Math.floor(lo + (hi - lo) / 2);
      if (today >= dates[mid].date) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    const day = dates[hi + 1].day.split("(")[1].split(")")[0];

    if (!day) res.sendStatus(401);
    else
      res.send([
        day,
        dates[hi + 1].date.toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      ]);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
