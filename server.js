import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || "tempsecret",
  })
);

const users = [
  {
    username: "anonymousUser",
    firstName: "Anonymous",
    lastName: "User",
    accessGroups: "loggedOutUsers",
  },
  {
    username: "jj",
    firstName: "James",
    lastName: "JustSignedUpton",
    accessGroups: "loggedInUsers,notApprovedUsers",
  },
  {
    username: "aa",
    firstName: "Ashley",
    lastName: "Approvedmemberton",
    accessGroups: "loggedInUsers, members",
  },
  {
    username: "kc",
    firstName: "Kyle",
    lastName: "ContentEditorton",
    accessGroups: "loggedInUsers, members, contentEditors",
  },
  {
    username: "ma",
    firstName: "Mindy",
    lastName: "Administraton",
    accessGroups: "loggedInUsers, members, admins",
  },
];

app.post("/login", (req, res) => {
  const username = req.body.username;
  // const password = req.body.password;
  const user = users.find((user) => user.username === username);
  if (user) {
    req.session.user = user;
    req.session.save();
    res.json(user);
  } else {
    res.status(500).send("bad access");
  }
});

app.get("/currentuser", (req, res) => {
  if (req.session.user) {
    res.user(req.session.user);
  } else {
    res.send("bad accsess");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("User logged out");
});

app.listen(PORT, (req, res) => {
  console.log(`API listening on port ${PORT}`);
});
