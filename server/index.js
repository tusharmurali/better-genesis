const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const genesis = require("./routes/api/genesis");

app.use("/api/genesis", genesis);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/public/"));
  app.get(/.*/, (req, res) => res.sendFile(__dirname + "/public/index.html"));
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`BetterGenesis started on port ${port}`));
