const express = require("express");
const Router = express.Router();
const { check } = require("express-validator");

const PostControllers = require("../controllers/posts");
const authCheck = require("../middleware/auth");
const fileUpload = require("../middleware/file-upload");

Router.get("/:pid", PostControllers.getPostById);

Router.get("/user/:userId", PostControllers.getPostsByUserId);

Router.use(authCheck);

Router.post(
  "/",fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("address").not().isEmpty(),
    check("description").not().isEmpty(),
  ],
  PostControllers.createPost
);

Router.patch("/:pid", [
    check("title").not().isEmpty(),
    check("description").not().isEmpty(),
  ], PostControllers.patchEditPost);

Router.delete("/:pid", PostControllers.deletePost);

module.exports = Router;
