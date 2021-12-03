import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

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

app.get("/user", async (req, res) => {
  const user = await User.find();
  res.json(user);
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  // const password = req.body.password;
  let user = await User.findOne({ username: username });
  if (!user) {
    user = await User.findOne({ username: "anonymousUser" });
  }
  req.session.user = user;
  req.session.save();
  res.json(user);
});

app.get("/currentuser", async (req, res) => {
  let user = req.session.user;
  if (!user) {
    user = await User.findOne({ username: "anonymousUser" });
  }
  res.json(user);
});

app.get("/logout", async(req, res) => {
  req.session.destroy();
  const user = await User.findOne({ username: "anonymousUser" });
  res.json(user);
});

app.listen(PORT, (req, res) => {
  console.log(`API listening on port ${PORT}`);
});
