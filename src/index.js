const express = require("express"); // nodejs framework
const path = require("path"); // used to join paths together

const app = express(); // create express-app constant
const port = 8080; // port used

app.use(express.static(path.join(__dirname, "static")));

app.use("/", (req, res, next) => {
  // middleware => this is executed before the app.get functions are used
  console.log(`Die Seite ${req.path} wurde aufgerufen.`); // logs the path of the page when it is accessed
  next();
});

app.get("/hello", (req, res) => {
  res.send("Hello World!"); // send a plain text to the client
});

app.get("/teapot", (req, res) => {
  res.sendStatus(418); // send a status code to the client (418 = "I'm a teapot!")
});

app.listen(port, () => {
  // tell the express app to listen to the specified port
  console.log(`Der Server läuft auf Port ${port}.`); // log the port when the server starts
});
