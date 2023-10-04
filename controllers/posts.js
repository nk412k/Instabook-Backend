const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { validationResult } = require("express-validator");
const fs = require("fs");

const Posts = require("../models/post");
const Users = require("../models/user");
const mongoose = require("mongoose");

exports.getPostById = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  try {
    post = await Posts.findById(postId);
  } catch (error) {
    return next(new HttpError("Failed to fetch the post", 422));
  }
  if (!post) {
    return next(
      new HttpError("could not find a post for the provided id", 404)
    );
  }
  res.json({ post: post.toObject({ getters: true }) });
};

exports.getPostsByUserId = async (req, res, next) => {
  const userId = req.params.userId;
  let posts;
  try {
    posts = await Posts.find({ creator: userId });
  } catch (error) {
    return next(new HttpError("Failed to fetch the posts", 422));
  }
  if (!posts) {
    return next(
      new HttpError("could not find a post for the provided user", 404)
    );
  }
  res.json({ posts: posts.map((p) => p.toObject({ getters: true })) });
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return new HttpError("Error in input data, please check it", 422);
  }
  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
    console.log(coordinates);
  } catch (error) {
    return next(error);
  }
  const createdPost = new Posts({
    title,
    description,
    imageUrl: req.file.path,
    location: coordinates,
    address,
    creator: req.userData.userId,
  });
  let user;
  try {
    user = await Users.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError("Failed to find the user", 422));
  }
  if (!user) {
    return next(new HttpError("Not authorised", 401));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Failed to create post", 422));
  }
  res.status(201).json({ post: createdPost.toObject({ getters: true }) });
};

exports.patchEditPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Error in input data, please check it", 422));
  }
  const pid = req.params.pid;
  let post;
  try {
    post = await Posts.findById(pid);
  } catch (error) {
    return next(new HttpError("Failed to fetch the post", 422));
  }
  if (!post) {
    return next(new HttpError("Post not found", 404));
  }
  if (post.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this post", 401));
  }
  const { title, description } = req.body;
  post.title = title;
  post.description = description;
  try {
    await post.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Failed to update post", 422));
  }
  res.json({ message: "Post updated" });
};

exports.deletePost = async (req, res, next) => {
  const pid = req.params.pid;
  let post;
  try {
    post = await Posts.findById(pid).populate("creator");
  } catch (error) {
    return next(new HttpError("Failed to fetch post", 422));
  }
  if (!post) {
    return next(new HttpError("Post not found", 404));
  }
  if (post.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this post", 401));
  }
  const image = post.imageUrl;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.deleteOne({ session: sess });
    post.creator.posts.pull(post);
    await post.creator.save({ session: sess });
    await sess.commitTransaction();
    fs.unlink(image, (err) => {
      console.log(err);
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Failed to delete the post", 422));
  }
  res.json({ message: "Post deleted successfully" });
};
