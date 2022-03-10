const express = require("express"); // nodejs framework
const path = require("path"); // used to join paths together
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const rug = require("random-username-generator");

const app = express(); // create express-app constant
const port = 8080; // port used

var userData = {};
var comments = [];

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  // middleware => this is executed before the app.get functions are used
  if (
    req.cookies.uid === undefined ||
    userData[req.cookies.uid] === undefined
  ) {
    const uid = uuidv4();
    userData[uid] = {
      name: rug.generate(),
      visitCounter: {},
      favouriteSites: []
    };
    res.cookie("uid", uid, {
      maxAge: 2147483647,
      httpOnly: true
    });
    req.cookies.uid = uid;
  }

  if (req.path.startsWith("/Rituale/")) {
    const user = userData[req.cookies.uid];
    // Track activity
    if (user.visitCounter[req.path] === undefined) {
      user.visitCounter[req.path] = 1;
    } else {
      user.visitCounter[req.path]++;
    }
    console.log(userData[req.cookies.uid].visitCounter);
  }

  console.log(`Die Seite ${req.path} wurde aufgerufen.`); // logs the path of the page when it is accessed
  next();
});

app.get("/api/users/@me", (req, res) => {
  const user = userData[req.cookies.uid];

  var mostVisited = null;
  const sortable = [];
  for (var site in user.visitCounter)
    sortable.push({ site: site, counter: user.visitCounter[site] });
  if (sortable.length > 0) {
    sortable.sort(function (a, b) {
      return b.counter - a.counter;
    });
    mostVisited = sortable[0];
  }

  res.status(200).json({
    uid: req.cookies.uid,
    name: user.name,
    mostVisited: mostVisited,
    favouriteSites: user.favouriteSites
  });
});

app.patch("/api/users/@me", (req, res) => {
  if (req.body.favouriteSites !== undefined) {
    const favouriteSites = req.body.favouriteSites;
    if (
      !favouriteSites instanceof Array ||
      !favouriteSites.every((val) => {
        return typeof val === "string" || val instanceof String;
      })
    )
      return res.status(400).json({
        error: "favouriteSites must be an array of strings."
      });

    userData[req.cookies.uid].favouriteSites = [...new Set(favouriteSites)];
  }
  res.status(200).json(userData[req.cookies.uid]);
});

app.get("/api/users/:id", (req, res) => {
  const user = userData[req.params.id];

  if (user === undefined)
    return res.status(404).json({
      error: "The user couldn't be found."
    });

  res.status(200).json({ uid: req.params.id, name: user.name });
});

app.post("/api/comments", (req, res) => {
  if (req.body.comment === undefined || req.body.comment === "")
    return res.status(400).json({
      error: "Invalid form body. 'comment' must be present and not empty."
    });
  const uid = req.cookies.uid;
  const comment = {
    uid: uid,
    comment: req.body.comment,
    createdAt: Date.now()
  };
  comments.push(comment);
  res.status(200).json(comment);
  console.log(comments);
});

app.get("/api/comments", (req, res) => {
  if (comments.lenght === 0) return res.status(204).json({});
  res.status(200).json(comments);
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  // tell the express app to listen to the specified port
  console.log(`Der Server läuft auf Port ${port}.`); // log the port when the server starts
});
