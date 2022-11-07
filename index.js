const express = require("express");
const app = express();
const cors = require("cors");

const server = require("./api/server");

//middleware
app.use(cors());
app.use(express.json());

app.use("/api/server", server);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
