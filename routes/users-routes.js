const express = require("express");
const Router = express.Router();
const { check } = require("express-validator");

const UserControllers = require("../controllers/users");
const fileUpload = require("../middleware/file-upload");

Router.get("/", UserControllers.getUsers);
Router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  UserControllers.postSignUp
);
Router.post(
  "/signin",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  UserControllers.postSignIn
);

module.exports = Router;
