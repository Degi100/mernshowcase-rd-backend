import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import UserModel from "./models/User.js";
import bcrypt from "bcrypt";

dotenv.config();
const saltRounds = Number(process.env.SALT_ROUNDS);

mongoose.connect(process.env.MONGOURI);

const app = express();
const PORT = 3003;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || "tempsecret",
  })
);

app.get("/users", async (req, res) => {
  const user = await UserModel.find();
  res.json(user);
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  // const password = req.body.password;
  let user = await UserModel.findOne({ username: username });
  if (!user) {
    user = await UserModel.findOne({ username: "anonymousUser" });
  }
  req.session.user = user;
  req.session.save();
  res.json(user);
});

app.get("/currentuser", async (req, res) => {
  let user = req.session.user;
  if (!user) {
    user = await UserModel.findOne({ username: "anonymousUser" });
  }
  res.json(user);
});

app.get("/logout", async (req, res) => {
  req.session.destroy();
  const user = await UserModel.findOne({ username: "anonymousUser" });
  res.json(user);
});

app.post("/createuser", async (req, res) => {
  const user = req.body.user;
  console.log(user)
  if (
    user.username.trim() === "" ||
    user.password1.trim() === "" ||
    user.password1 !== user.password2
  ) {
    res.sendStatus(403);
  } else {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(user.password1, salt);
    const _user = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      hash,
      accessGroups: "loggedInUsers, notYetApprovedUsers",
    };
    const dbuser = await UserModel.create(_user);
    res.json({
      userAdded: dbuser,
    });
  }
});

app.listen(PORT, (req, res) => {
  console.log(`API listening on port ${PORT}`);
});
