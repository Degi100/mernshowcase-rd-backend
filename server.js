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

const userIsInGroup = (user, accessGroup) => {
  const accessGroupArray = user.accessGroups.split(",").map((m) => m.trim());
  return accessGroupArray.includes(accessGroup);
};

app.get("/users", async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let dbuser = await UserModel.findOne({ username: username });
  if (!dbuser) {
    dbuser = await UserModel.findOne({ username: "anonymousUser" });
  } else {
    bcrypt.compare(password, dbuser.hash).then((passwordIsOk) => {
      if (passwordIsOk) {
        req.session.user = dbuser;
        req.session.save();
        res.json(dbuser);
      } else {
        res.sendStatus(403);
      }
    });
  }
});

app.get("/currentuser", async (req, res) => {
  let user = req.session.user;
  if (!user) {
    user = await UserModel.findOne({ username: "anonymousUser" });
  }
  res.json(user);
});

app.post("/createuser", async (req, res) => {
  const frontendUser = req.body.user;
  console.log(frontendUser);
  if (
    frontendUser.username.trim() === "" ||
    frontendUser.password1.trim() === "" ||
    frontendUser.password1 !== frontendUser.password2
  ) {
    res.sendStatus(403);
  } else {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(frontendUser.password1, salt);
    const backendUser = {
      firstName: frontendUser.firstName,
      lastName: frontendUser.lastName,
      username: frontendUser.username,
      email: frontendUser.email,
      hash,
      accessGroups: "loggedInUsers, notYetApprovedUsers",
    };
    const dbuser = await UserModel.create(backendUser);
    res.json({
      userAdded: dbuser,
    });
  }
});

app.post("/approveuser", async (req, res) => {
  const id = req.body.id;
  let user = req.session.user;
  if (!user) {
    res.sendStatus(403);
  } else {
    if (!userIsInGroup(user, "admins")) {
      res.sendStatus(403);
    } else {
      const updateResult = await UserModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { accessGroups: "loggedInUsers,members" } },
        { new: true }
      );
      res.json({ result: updateResult });
    }
  }
});

app.get("/notyetapprovedusers", async (req, res) => {
  const users = await UserModel.find({
    accessGroups: { $regex: "notYetApprovedUsers", $options: "i" },
  });
  res.json({ users });
});

app.delete("/deleteuser", async (req, res) => {
  const id = req.body.id;
  const user = await UserModel.findByIdAndDelete({
    _id: new mongoose.Types.ObjectId(id),
  });
  res.json({ user });
});

app.get("/logout", async (req, res) => {
  req.session.destroy();
  const user = await UserModel.findOne({ username: "anonymousUser" });
  res.json(user);
});

app.listen(PORT, (req, res) => {
  console.log(`API listening on port ${PORT}`);
});
