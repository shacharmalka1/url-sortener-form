require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ShortUrl = require("./models/shortUrl");
const cors = require("cors");
const path = require("path");
const User = require("./models/userScheme");
const bcrypt = require("bcryptjs");
const middleware = require("./middleware/errorHandler");
const token = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const db = process.env.DB_URI;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch(() => {
    console.log("You Messed Up Something In The Database");
  });

app.use(cors());
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", middleware.authToken, async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render("index", { shortUrls: shortUrls });
  } catch (error) {
    console.error(error);
  }
});

app.post("/shortUrls", async (req, res) => {
  try {
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.get("/clear", async (req, res) => {
  try {
    await ShortUrl.deleteMany({});
    const shortUrls = await ShortUrl.find();
    res.render("index", { shortUrls: shortUrls });
  } catch (error) {
    console.error(error);
  }
});

app.get("/clearone/:shortUrlId", async (req, res) => {
  try {
    await ShortUrl.deleteOne({ short: req.params.shortUrlId });
    const shortUrls = await ShortUrl.find();
    res.render("index", { shortUrls: shortUrls });
  } catch (error) {
    console.error(error);
  }
});
app.get("/login", (req, res) => {
  console.log(req.cookies[{}]);
  if (req.cookies[{}])
    return res.send(
      `<script>alert("you are already logged in"); window.location.href = "/"; </script>`
    );
  res.render("login");
});
app.get("/prize", middleware.authToken, (req, res) => {
  console.log(`welcome! ${req.user.name}`);
  res.render("prize");
});
app.get("/logout", middleware.authToken, (req, res) => {
  res.clearCookie(req.user).redirect("/login");
});
app.post("/login", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  const username = req.body.username;
  const user = {
    name: username,
  };
  const newToken = token.sign(user, process.env.SECRET, {
    expiresIn: "60000s",
  });
  res.cookie(user, newToken).redirect("/");
  //  res.render('index',{ shortUrls: shortUrls })
});
app.post("/register", middleware.registerValidation, async (req, res) => {
  const shortUrls = await ShortUrl.find();
  bcrypt.hash(req.body.password, 8, function (err, hash) {
    const cryptPassword = hash;
    User.create({
      email: req.body.email,
      username: req.body.username,
      password: cryptPassword,
    });
  });
  res.redirect("/login");
});
app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.render(404);
  shortUrl.clicks++;
  shortUrl.save();
  res.redirect(shortUrl.full);
});

app.listen(8080, () => {
  console.log("Server listening in http://localhost:8080");
});
