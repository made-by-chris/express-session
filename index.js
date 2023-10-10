import express from "express";
import session from "express-session";
import { engine } from "express-handlebars";

import fs from "fs";

const data = [8019283912, 12312898498, 372183283, 12398483, 21312, 123, 543543543, 2312323];

const PORT = 8080;
const LOGS = "logs.txt";

const app = express();

app.engine("handlebars", engine({ defaultLayout: null }));
app.set("view engine", "handlebars");

// SESSION
app.use(session({ secret: "keyboard cat", cookie: { maxAge: 60000 * 60 * 24 * 2 } }));

// LOGGER
app.use((request, response, next) => {
  console.log(`${request.method} ${request.path} ${Date.now()}`);
  fs.appendFileSync(LOGS, `${request.method} ${request.path} ${Date.now()}\n`);
  next();
});

// JSON BODY PARSING
app.use(express.json());

// LOGIN
app.post("/profile", (req, res) => {
  req.session.nickname = req.body.nickname;
  res.send({ success: true });
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send({ success: true });
});

app.use((req, res, next) => {
  req.session.views = req.session.views ? req.session.views + 1 : 1;
  next();
});

app.get("/logged-in", (req, res) => {
  if (!req.session.nickname) {
    res.redirect("/");
    return;
  }
  res.render("existing-user", { nickname: req.session.nickname, views: req.session.views, sid: req.session.id, expiration: req.session.cookie.maxAge / 1000 });
});

app.get("/", function (req, res, next) {
  if (req.session.nickname) {
    res.redirect("/logged-in");
    return;
  }
  res.render("new-user");
});

// error handling middleware

app.get("/data", (request, response) => {
  response.send(data);
});

app.listen(PORT, () => console.log(`express-session API listening on http://localhost:${PORT}`));
