const User = require("../models/userScheme");
const { passwordStrength } = require("check-password-strength");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const token = require("jsonwebtoken");

/* Reurn true if it's a letter false otherwise */
function isLetter(str) {
  return /^[A-Z]*$/.test(str.toUpperCase());
}

/* Get an email and check if it's belongs to some document in the database. */
/* Returns true if the email belongs to some document and otherwise returns false . */
async function isUserNameExist(UserName) {
  const searchUser = await User.findOne({ username: UserName });
  if (!searchUser) return false;
  else return true;
}

/* Get an email and check if it's belongs to some document in the database. */
/* Returns true if the email belongs to some document and otherwise returns false . */
async function isEmailExist(checkEmail) {
  const searchEmail = await User.findOne({ email: checkEmail });
  if (!searchEmail) return false;
  return true;
}
const a = "hello";
async function registerValidation(req, res, next) {
  //validate all fields
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const checkUserName = await isUserNameExist(username);
  const checkEmail = await isEmailExist(email);
  if (checkUserName)
    return res.send(
      `<script>alert("Username already exists"); window.location.href = "/"; </script>`
    );
  if (!isLetter(username.charAt(0)) || !username.length > 6)
    return res.send(
      `<script>alert("username needs to contain at least 6 characters and start with a letter"); window.location.href = "/"; </script>`
    );
  if (checkEmail)
    return res.send(
      `<script>alert("email already exist"); window.location.href = "/"; </script>`
    );
  if (!validator.isEmail(email))
    return res.send(
      `<script>alert("email must be real"); window.location.href = "/"; </script>`
    );
  if (passwordStrength(password).value === "Too weak")
    return res.send(
      `<script>alert("password isn't strong enough, make sure you type at least 6 characters and using letters and numbers"); window.location.href = "/"; </script>`
    );
  next();
}

async function loginValidation(req, res, next) {
  const userName = req.body.username;
  const checkUserName = await isUserNameExist(userName);
  if (!checkUserName)
    return res.send(
      `<script>alert("Username is wrong"); ;window.location.href = "/"; </script>`
    );
  const userNameObject = await User.findOne({ username: userName });
  const hashPassword = userNameObject.password;
  const checkPassword = await bcrypt.compare(req.body.password, hashPassword);
  if (!checkPassword)
    return res.send(
      `<script>alert("password is wrong"); window.location.href = "/"; </script>`
    );
  next();
}

async function authToken(req, res, next) {
  let auth = String(req.headers.cookie);
  const recievedToken = auth.split("=")[1];
  if (recievedToken == null)
    return res.send(
      `<script>alert("you are not logged in"); window.location.href = "/login"; </script>`
    );
  token.verify(recievedToken, process.env.SECRET, (err, user) => {
    if (err)
      return res.send(
        `<script>alert("incorrect token"); window.location.href = "/logout"; </script>`
      );
    req.user = user;
    next();
  });
}

const middleware = { registerValidation, loginValidation, authToken };
module.exports = middleware;
